---
author: haya
title: http版本区别
date: 2018-10-30
article: true
timeline: true
category: 基础知识
tag:
- 基础知识
- http
---

## http0.9
最早的http协议、只支持get方法

## http1.0
改善了http0.9的不足、请求头+请求体、响应头+响应体
短连接 : 每次请求都需要tcp三次握手、四次挥手
连接限制: 无

## http1.1
长连接 : keep-alive，每次请求后不会马上四次挥手、断开连接。多个请求复用一次tcp连接
连接限制 : chrome下，同一域名下的最大连接并发数=6

## http2.0
连接限制 :一个连接
请求压缩 : 会压缩和缓存header、减少数据传输
请求分帧 : 打散压缩后请求数据，然后分成一帧一帧的数据，请求之间不再是同步的了
服务端push : 不同于websocket的服务端主动发送数据的方式
## http3.0
udp