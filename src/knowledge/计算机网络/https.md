---
author: haya
title: https
date: 2018-10-30
article: true
timeline: true
category: 基础知识
tag:
- 基础知识
- http
- https
---


![](/assets/knowledge/计算机网络/https/1.png)
![](/assets/knowledge/计算机网络/https/2.png)

- 客户端---->服务端：发送支持的SSL版本、非对称加密算法，发送随机数1
- 服务端---->客户端：定下来使用的SSL版本、对称加密算法，   随机数2。证书
- 客户端-----> 认证证书，得到公钥
- 客户端----->服务端：公钥加密的随机数3，hash(随机数1，随机数2)=xx
- 服务端-----> 验证xx==hash(随机数1，随机数2)，使用随机数1,2,3生成对称秘钥

![](/assets/knowledge/计算机网络/https/3.png)
