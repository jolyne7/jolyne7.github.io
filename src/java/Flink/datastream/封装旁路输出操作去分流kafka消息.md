---
author: haya
title: 封装旁路输出操作去分流kafka消息
date: 2022-11-13
article: true
timeline: true
category: java
tag:
- flink
- 旁路输出
---

## 一、实现效果

用filter分流有filter算子重复计算的问题，于是乎就想到了用旁路输出分流日志，设计效果如下：

```java
// kafka topic中读取的事件流
DataStream<String> stream = ...;
// TopicStreamHolder持有stream，并通过XXXFunction将不同的事件分流
var topicHolder = new TopicStreamHolder<>(stream, new XXXFunction());
// 获取FirstAudioFrame的outPutTag
var outputTag = getOutputTag(FirstAudioFrame.class);
// LogStreamHolder使用outputTag从TopicStreamHolder的输出流中获取对应的事件流
var logStream = new LogStreamHolder<>(topicHolder, outputTag).getOutputStream();
```

## 二、具体实现

### 2.1 StreamHolder
定义StreamHolder接口：
```java
public interface StreamHolder<I,O> {
    DataStream<O> getOutputStream();
    DataStream<I> getInputStream();
}
```
### 2.2 TopicStreamHolder
TopicStreamHolder实现StreamHolder接口：
```java
@Accessors(chain = true)
@Data
public class TopicStreamHolder<I, O> implements StreamHolder<I, O> {
    // 输入流
    private DataStream<I> stream;
    // 输出流
    private DataStream<O> processedStream;
    // 分流函数
    private ProcessFunction<I, O> processFunction;
    // 分流函数并行度
    private int parallelism;

    public TopicStreamHolder() {}

    public TopicStreamHolder(
            DataStream<I> stream,
            ProcessFunction<I, O> processFunction
    ) {
        this(stream, processFunction, 1);
    }

    public TopicStreamHolder(
            DataStream<I> stream,
            ProcessFunction<I, O> processFunction,
            int parallelism
    ) {
        this.stream = stream;
        this.processFunction = processFunction;
        this.parallelism = parallelism;
    }

    @Override
    public DataStream<O> getOutputStream() {
        if (processedStream == null) {
            processedStream = getInputStream()
                    // 应用分流函数
                    .process(processFunction)
                    .setParallelism(parallelism);
        }
        return processedStream;
    }


    @Override
    public DataStream<I> getInputStream() {
        return this.stream;
    }
}
```

### 2.3 LogStreamHolder
利用装饰器模式，让LogStreamHolder持有TopicStreamHolder
```java
// PI、PO是TopicStreamHolder的输入输出类型
// I、O是LogStreamHolder的输入输出类型
@Accessors(chain = true)
public class LogStreamHolder<I extends PO, O, PI, PO> extends TopicStreamHolder<I,O> {

    private final StreamHolder<PI, PO> holder;
    private final OutputTag<O> outputTag;

    public LogStreamHolder(
            TopicStreamHolder<PI, PO> holder,
            OutputTag<O> outputTag
    ) {
        super();
        this.holder = holder;
        this.outputTag = outputTag;
    }

    @Override
    public DataStream<O> getOutputStream() {
        // 根据outputTag获取对应的事件流
        return getInputStream().getSideOutput(outputTag);
    }

    // TopicStreamHolder的输出流就是LogStreamHolder输入流
    @Override
    public SingleOutputStreamOperator<I> getInputStream() {
        return (SingleOutputStreamOperator<I>) holder.getOutputStream();
    }
}
```

### 2.4 分流函数XXXFunction

```java
public class XXXFunction extends ProcessFunction<String, XXXLog> {
    @Override
    public void processElement(
            String value,
            ProcessFunction<String, XXXLog>.Context ctx,
            Collector<XXXLog> out
    ) throws Exception {
        // 正则提取出事件类型
        var type = LogUtils.getMatchType(value);
        if (StringUtils.isBlank(type)) {
            return;
        }
        // 根据事件类型获取枚举 
        var typeEnum = XXXLogType.getEnumByType(type);
        if (typeEnum == null) {
            return;
        }
        output(value, ctx, typeEnum);
    }

    private void output(
            String value,
            ProcessFunction<String, PaasLog>.Context ctx,
            PaasLogType typeEnum
    ) {
        try {
            // 获取时间对应的java类
            var clazz = typeEnum.getClazz();
            // json序列化成对象
            var log = JSON.parseObject(value, clazz);
            // 获取outputTag
            var outputTag = (OutputTag<XXXLog>) typeEnum.getOutputTag();
            if (outputTag == null) {
                return;
            }
            // 旁路输出
            ctx.output(outputTag, log);
        } catch (Exception ignored) {
        }
    }
}
```