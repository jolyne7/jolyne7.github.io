---
author: haya
title: 为什么要使用自增 ID 作为主键
date: 2020-03-10
article: true
timeline: true
category: mysql
tag:
- mysql
---


## 自增 ID 有什么好处？
- 主键索引有序，不用担心因为主键随机的特性，导致B+树频繁的上溢而产生的性能问题
- 不用担心主键重复问题
