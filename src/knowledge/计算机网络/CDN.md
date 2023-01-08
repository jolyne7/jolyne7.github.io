---
author: haya
title: CDN
date: 2021-07-23
article: true
timeline: true
category: 基础知识
tag:

- 计算机网络
- cdn

---

## 一、CDN

内容分发网络（Content Delivery Network，简称CDN）。

## 二、为什么用CDN

本质上是缓存，依赖于对象存储（S3、oss、cos等），当请求到CDN的静态资源不存在时，会回源从对象存储上获取资源。。。

- 便宜：相比从对象存储的价钱、CDN的价格更便宜
- 用户访问快：依托于分布式的特点，用户通过DNS CNAME, 可以就近的从CDN服务器上获取资源
- 减轻服务器压力：用户访问资源多数存在于CDN上，只有在回源时会请求到服务器或对象存储上

## 三、缓存不一致

- 等过期：🐶
- 使用新名字：例如：xx.png，更新后变yy.png,会触发回源
- 使用版本号：例如：xx.png? v=1，更新后变成xx.png? v=2，会触发回源
- 不使用版本号：例如：xx.png，更新后还是xx.png，那么可以使用云厂商sdk提供的api或者在云厂商提供的后台，刷新对应的资源。