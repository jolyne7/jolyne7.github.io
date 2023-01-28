---
author: haya
title: CAP原则
date: 2021-10-01
article: true
timeline: true
category: 基础知识
tag:
- 分布式
- cap
---

## 一、什么是CAP
CAP 也就是 Consistency（一致性）、Availability（可用性）、Partition Tolerance（分区容错性） 这三个单词首字母组合。

- 一致性（Consistency） : 所有节点访问同一份最新的数据副本 
- 可用性（Availability）: 非故障的节点在合理的时间内返回合理的响应（不是错误或者超时的响应）。 
- 分区容错性（Partition tolerance） : 分布式系统出现**网络分区**的时候，仍然能够对外提供服务。

## 二、什么是网络分区
分布式系统中，多个节点之前的网络本来是连通的，但是因为某些故障（比如部分节点网络出了问题）某些节点之间不连通了，整个网络就分成了几块区域，这就叫网络分区。

## 三、不可能三角
当发生网络分区的时候，如果我们要继续服务，那么强一致性和可用性只能 2 选 1。也就是说当网络分区之后 P 是前提，决定了 P 之后才有 C 和 A 的选择。也就是说分区容错性（Partition tolerance）我们是必须要实现的。 简而言之就是：CAP 理论中分区容错性 P 是一定要满足的，在此基础上，只能满足可用性 A 或者一致性 C。

因此，分布式系统理论上不可能选择 CA 架构，只能选择 CP 或者 AP 架构。

CP: ZooKeeper、HBase、etcd
AP: Cassandra、Eureka、redis
CP或AP: Nacos

### 3.1 为什么不可能出现CA架构
若系统出现“分区”，系统中的某个节点在进行写操作。为了保证 C， 必须要禁止其他节点的读写操作，这就和 A 发生冲突了。如果为了保证 A，其他节点的读写操作正常的话，那就和 C 发生冲突了。

