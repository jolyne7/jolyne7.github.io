---
author: haya
title: tcp
date: 2018-10-30
article: true
timeline: true
category: 基础知识
tag:
- 计算机网络
- tcp
---

## 什么是 TCP
TCP 是面向连接的、可靠的、基于字节流的传输层通信协议。

TCP 是一个工作在传输层的可靠数据传输的服务，它能确保接收端接收的网络包是无损坏、无间隔、非冗余和按序的

## 什么是 TCP 连接
用于保证可靠性和流量控制维护的某些状态信息，这些信息的组合，包括Socket、序列号和窗口大小称为连接

建立一个 TCP 连接是需要客户端与服务端端达成上述三个信息的共识。
- Socket：由 IP 地址和端口号组成
- 序列号：用来解决乱序问题等
- 窗口大小：用来做流量控制

## TCP 连接建立
### 三次握手

- 客户端: SYN=1, Seq=x 进入syn_sent状态
- 服务端: SYN=1, ACK=1, Seq=y, ack =x+1， 有listen状态进入syn_recd状态
- 客户端: ACK=1, ack=y+1， 进入established状态
- 服务端: 进入established状态

### 为什么是三次握手
- 三次握手才可以阻止重复历史连接的初始化（主要原因）
- 三次握手才可以同步双方的初始序列号
- 三次握手才可以避免资源浪费

> 我们来看看 RFC 793 指出的 TCP 连接使用三次握手的首要原因：
The principle reason for the three-way handshake is to prevent old duplicate connection initiations from causing confusion.
简单来说，三次握手的首要原因是为了防止旧的重复连接初始化造成混乱