---
author: haya
title: Raft共识算法
date: 2021-11-10
article: true
timeline: true
category: 基础知识
tag:
- 分布式
- raft
---


## 一、先讲讲Paxos算法

Paxos 算法诞生于 1990 年，这是一种解决分布式系统一致性的经典算法 。但是，由于 Paxos 算法非常难以理解和实现，不断有人尝试简化这一算法。到了2013 年才诞生了一个比 Paxos 算法更易理解和实现的分布式一致性算法—Raft 算法。

## 二、Raft算法

算法可互动动画：https://raft.github.io/raftscope/index.html

在使用Raft算法的集群中，任何一个节点可以扮演下面角色之一：
- Leader: 处理所有客户端交互，日志复制等，一般一次只有一个Leader
- Follower: 类似选民，完全被动
- Candidate候选人: 可以被选举成为Leader的节点

### 2.1 大概的流程
- 任何一个Follower察觉到没有Leader时，会成为一个候选者Candidate，它向其他Follower发出要求选举自己的请求。
- 其他Follower同意了，发出OK。候选者可以自己选自己，只要达到N/2 + 1 的大多数票，候选人还是可以成为Leader的。
- 当候选者就成为了Leader后，它可以向选民也就是Follower们发出指令，比如进行日志复制。
- Leader会定期的向Follower发送心跳，证明自己还活着。
- 当Leader挂掉后，那么Follower中有一个成为候选者，发出投票选举

## 三、详解

### 3.1 Leader选举
Leader会定期的向Follower发送心跳，证明自己还活着

如果Follower一段时间内没有收到Leader的心跳，就会认为leader没了，然后成为Candidate开始选举。

成为Candidate后，会先增加==任期号==, 然后投票给自己，并向其它Follower节点发送投票请求（RequestVote RPC）。

选举结果：
- 如果获得超过半数的选票，就会成为leader，开始向follower发送心跳
- 如果是其它Candidate成为leader，当前节点收到新leader的心跳，并且新leader的任期号不小于当前节点的任期号，那么当前节点就从Candidate变为follower
- 一段时间后没有任何获胜者，那么每个Candidate都在自己的随机选举超时时间后增加任期号，然后开始新一轮的选举
> 为什么会出现没有任何获胜者的情况？多个follower成为Candidate，使得投票过于分散，没有任何一个Candidate得票超过半数


### 3.2 日志复制

集群选举产生leader后，就可以为客户端提供服务

但是客户端怎么知道哪个节点是leader呢？ 当客户端请求一个节点时：
- 节点刚好是leader，这是坠好的
- 节点是follower，follower会告知客户端谁是leader节点
- 节点挂了，客户端会轮询别的节点，直到找到leader节点

leader接收到客户端的指令后，会将指令最为一个新的条目追加到日志中，一条日志包含三个主要信息：
- 状态机指令
- leader任期号
- 日志号


leader会并行的发送AppendEntries RPC给follower，让它们复制日志。

当超过半数的follower完成日志复制后，leader就会执行客户端的指令，并返回结果。

#### 异常情况的处理

leader或follower都有挂掉的可能，raft必须保证在有节点挂掉的情况下，继续完成日志的复制，并保证每个副本日志的顺序一致性。

- 如果复制日志时，follower没有给leader任何响应，那么leader就会不断发送AppendEntries RPC
- 如果follower挂了，然后恢复了，这时会触发**一致性检查**，保证follower能按顺序的复制缺失的日志

> 一致性检查: leader发送的AppendEntries RPC请求中，会带有前一个日志的日志号、任期号，如果follower在已复制的日志中对应的日志号，那么他就会拒绝此次RPC请求。然后leader就会发送前前一个日志，循环往复。。。。直到找到第一个缺失的日志。

- 如果leader挂了，有一部分follower已经复制了日志，但leader还没有执行客户端的指令并返回。如果此时新选举产生的leader正好没有复制刚刚的日志，那么此时就出现了follower比leader日志多、不一致的情况。
> 此时意味着follower所拥有的日志是无效的，因为**leader还没有执行客户端的指令并返回**。那么既然无效，就直接强制让当前所有follower保持与leader一致就行，与leader不同的日志会被覆盖掉。