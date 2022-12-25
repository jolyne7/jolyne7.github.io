---
author: haya
title: Topic
date: 2022-07-23
article: true
timeline: true
category: java
tag:
- java
- kafka
---

topic是由多个分区组成的，消息要往哪个分区存储是由生产者决定的。
分区是由主分区和副本分区组成，主分区负责读写，副本分区负责冗余，主分区的broker挂了，副本分区就会顶上去。
1. AR（Assigned Replicas）一个partition的所有副本
2. Leader 分区 负责读写的分区
3. Follower 分区 负责冗余存储的分区
4. replica.lag.time.max.ms  follower与leader同步延迟时间。在指定时间内完成同步的分区会被算作ISR，否则算作OSR
5. ISR（In-Sync Replicas）能够和 leader 保持同步的 follower + leader本身 组成的集合。
6. OSR（Out-Sync Replicas）不能和 leader 保持同步的 follower 集合
   AR=ISR+OSR

##  ISR的作用是什么?
我们思考一下，我们知道了与leader保持同步的副本集后，可以做到哪些事情？
1、当我们生产消息的时候，到底要写入多少副本才能算成功呢？
2、当leader挂了之后，我们应该选择哪个follower来成为新的leader呢？
那么对应的，通过ISR，我们知晓了哪些follower与leader保持着同步，
那么我们就可以在写入消息的时候，设置写入处于ISR中所有的副本才算成功，
那么我们在进行leader切换的时候，就可以从ISR中选择对应的follower成为新的leader。
这就是ISR的作用：是通过副本机制实现消息高可靠，服务高可用时，不可缺少的一环；这也是为什么讲到副本不得不提到ISR的原因。