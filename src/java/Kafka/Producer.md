---
author: haya
title: Producer
date: 2022-07-23
article: true
timeline: true
category: java
tag:
- java
- kafka
---

负责生成并发送消息到kafka的一方称之为生产者（Producer）

## 生产者发送消息全流程
![](/assets/java/kafka/1.png)

消息想从 Producer 端发送到 Broker 端，必须要先知道 Topic 在 Broker 的分布情况，才能判断消息该发往哪些节点，比如：「Topic 对应的 Leader 分区有哪些」、「Leader分区分布在哪些 Broker 节点」、「Topic 分区动态变更」等等，所以及时获取元数据对生产者正常工作是非常有必要的。

1. 先将消息包装成ProducerRecord
2. 序列化
3. 获取topic元数据信息，分配消息写入到topic哪个分区上
4. 缓冲区
5. 发往同一个topic的消息会被放sender线程发送给对应的broker
6. 服务器在收到这些消息时会返回一个响应
   如果消息成功写入kafka,就返回一个RecordMetaData对象，它包含了主题和分区信息，以及记录在分区里的偏移量。
   如果写入失败，则会返回一个错误。生产者在收到错误之后会尝试重新发送消息，几次之后如果还是失败，就返回错误信息。

## 生产者参数调优

<table>
    <tr>
        <td>参数名</td>
        <td>作用</td>
        <td>默认值</td>
        <td>推荐值</td>
    </tr>
    <tr>
        <td>retries</td>
        <td>发送消息失败后，重试次数</td>
        <td>3</td>
        <td></td>
    </tr>
    <tr>
        <td>retries.backoff.ms</td>
        <td>每次重试的时间间隔</td>
        <td>100ms</td>
        <td></td>
    </tr>
    <tr>
        <td>acks</td>
        <td>
            应答策略 <br />
            -1 消息发送到leader分区，然后还需要被同步到ISR副本分区才算成功 <br />
            0 消息被broker接收到就算成功 <br />
            1 消息被leader分区接收到结算成功  <br />
        </td>
        <td>1</td>
        <td>1</td>
    </tr>
    <tr>
        <td>batch.size</td>
        <td>消息批次大小</td>
        <td>16kb</td>
        <td></td>
    </tr>
    <tr>
        <td>linger.ms</td>
        <td>
         超时等待时间 <br/>
         避免消息因为batch.size而迟迟没有发送出去
        </td>
        <td>0ms</td>
        <td></td>
    </tr>
    <tr>
        <td>buffer.memory</td>
        <td>
         缓冲区大小 <br/>
         如果缓冲区设置太小的话，容易满，一旦缓冲区满了，就会阻塞上游业务
        </td>
        <td>32MB</td>
        <td></td>
    </tr>
    <tr>
        <td>metadata.max.age.ms</td>
        <td>元数据过期时间</td>
        <td>5分钟</td>
        <td></td>
    </tr>
</table>




## 拦截器

## 序列化器

## 分区器

- 指明 partition 的情况下，直接将指明的值直接作为 partiton 值；
- 没有指明 partition 值但有 key 的情况下，将 key 的 hash 值与 topic 的 partition 数进行取余得到 partition 值；
- 既没有 partition 值又没有 key 值的情况下， kafka采用Sticky Partition(黏性分区器)，会随机选择一个分区，并尽可能一直使用该分区，待该分区的batch已满或者已完成，kafka再随机一个分区进行使用.(以前是一条条的轮询，现在是一批次的轮询)