---
author: haya
title: 双流join
date: 2022-06-13
article: true
timeline: true
category: java
tag:
- flink
- 双流join
---

## 一、什么是双流join

跟mysql中join两张表类似，通过相同的字段将两条记录关联起来。

不同的是flink中是实时的关联。

## 二、代码实现
dataStream api实现双流join有很多种方式：
- connect + flatMap
- window join
- interval join
- coGroup

本人更倾向于使用connect + flatMap，因为更实现起来更灵活，对状态的操作更方便。其它几个基本都算窗口操作，比较消耗性能
### 2.1 connect + flatMap

```java
// push消息事件
var pushMessageStream = ...;
// 接收消息事件
var receiveMessageStream = ...;
return pushMessageStream
        // 根据eventid分组
        .keyBy(item -> item.getEventId())
        // connect根据eventid分组的receiveMessageStream
        .connect(receiveMessageStream.keyBy(item -> item.getEventId()))
        // join
        .flatMap(new JoinPushAndReceiveFunction())
        .map(JsonUtils::toUnderlineJSON);
```
join的逻辑主要在flatMap这个算子中, 具体实现代码如下：
```java
public class JoinPushAndReceiveFunction extends RichCoFlatMapFunction<PushMessageDWD, ReceiveMessageDWD, PushMessageResult> {
    private ValueState<PushMessageDWD> pushMessageValueState;
    private ValueState<ReceiveMessageDWD> receiveMessageValueState;

    @Override
    public void open(Configuration parameters) {
        var context = getRuntimeContext();
        // 获取ValueState
        pushMessageValueState = StateUtils.getValueState(PushMessageDWD.class, context);
        receiveMessageValueState = StateUtils.getValueState(ReceiveMessageDWD.class, context);
    }

    @Override
    public void flatMap1(PushMessageDWD value, Collector<PushMessageResult> out) throws Exception {
        // 将push事件更新到valueState中
        pushMessageValueState.update(value);
        collectResult(out, value, receiveMessageValueState.value());
    }

    @Override
    public void flatMap2(ReceiveMessageDWD value, Collector<PushMessageResult> out) throws Exception {
        // 将receive事件更新到valueState中
        receiveMessageValueState.update(value);
        collectResult(out, pushMessageValueState.value(), value);
    }

    /**
     * join
     * @param out
     * @param push
     * @param receive
     */
    public void collectResult(
            Collector<PushMessageResult> out,
            PushMessageDWD push,
            ReceiveMessageDWD receive
    ) {
        // push事件等于null时返回
        if (push == null) {
            return;
        }
        // 将push事件需要的字段set进result中
        var result = new PushMessageResult();
        result.setDate(push.getTimestamp().toLocalDate());
        result.setTimestamp(push.getTimestamp());
        result.setTraceId(push.getTraceId())
                .setMsg(push.getMsg())
                .setCompanyId(push.getCompanyId())
                .setCompanyName(push.getCompanyName())
                .setTargetId(push.getTargetId())
                .setResult(false);
        // push事件等于null时,收集result并返回
        if (receive == null) {
            out.collect(result);
            return;
        }
        // 将receive事件需要的字段set进result中
        result.setResult(true);
        result.setElapsed(DateUtils.absMinus(
                push.getTimestamp(),
                receive.getTimestamp()
        ));
        // 收集result
        out.collect(result);
        // 手动清空valueState，避免valueState太多、没有过期，导致的checkpoint过大
        pushMessageValueState.clear();
        receiveMessageValueState.clear();
    }
}

```

### 2.2 window join

```java
pushMessageStream
  .join(receiveMessageStream)
  .where(item -> item.getEventId())
  .equalTo(item -> item.getEventId())
  .window(TumblingEventTimeWindows.of(Time.seconds(10)))
  .apply(new JoinFunction<PushMessageDWD, ReceiveMessageDWD, PushMessageResult> (){
    @Override
    public PushMessageResult join(PushMessageDWD push, ReceiveMessageDWD receive){
      //.....
    }
  })
```

个人不太喜欢使用这种方式，不怎么灵活，无法实现left join、right join, 还有就是window性能不怎么样

### 2.3 interval join

```java
pushMessageStream
  .keyBy(item -> item.getEventId())
  .intervalJoin(receiveMessageStream.keyBy(record -> item -> item.getEventId()))
  .between(Time.seconds(-30), Time.seconds(30))
  .process(new ProcessJoinFunction<PushMessageDWD, ReceiveMessageDWD, PushMessageResult>() {
    @Override
    public void processElement(
            PushMessageDWD push, 
            ReceiveMessageDWD orderRecord, 
            Context context, 
            Collector<String> collector
    ) throws Exception {
      // ...
      collector.collect(...);
    }
  })
```

相比较与window join，可以实现left join、right join

### 2.4 coGroup

```java
pushMessageStream
  .coGroup(receiveMessageStream)
  .where(item -> item.getEventId())
  .equalTo(item -> item.getEventId())
  .window(TumblingEventTimeWindows.of(Time.seconds(10)))
  .apply(new CoGroupFunction<PushMessageDWD, ReceiveMessageDWD, PushMessageResult>() {
    @Override
    public void coGroup(
        Iterable<PushMessageDWD> pushRecords, 
        Iterable<ReceiveMessageDWD> receiveRecords, 
        Collector<PushMessageResult> collector
    ) throws Exception {
      // ...
    }
  })
```

相比较与window join，可以实现left join、right join

