---
author: haya
title: Consumer
date: 2022-07-23
article: true
timeline: true
category: java
tag:
- java
- kafka
---

## ConsumerGroup
消费者组是kafka提供的可横向扩展的消费机制，目的是使得横向扩展消费者，提升消费能力变得轻松。

消费者组是是由一个或多个消费者端组成的。一个消费者组里的消费者共享一个topic，topic里的一条数据只会被消费者组里的某一个消费者消费，而不会被所有消费者消费。

在开发编写消费者程序时，只需要指定group.id和topic 即可
```
group.id: test
topic: topic-1
```
程序指定当前消费者组的名称为test，该消费者组去消费topic-1。当程序起了三个实例时，那么此时该消费者组里，有三个消费者，这三个消费者都会消费topic-1

## 消费者参数调优配置

## 指定offset\时间消费