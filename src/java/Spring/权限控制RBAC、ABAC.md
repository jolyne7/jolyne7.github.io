---
author: haya
title: 权限控制RBAC、ABAC
date: 2023-01-27
article: true
timeline: true
category: java
tag:
- 权限控制
- RBAC
- ABAC
---
学习了解一下ABAC, 探讨与RBAC的优劣

## 一、什么是RBAC
基于角色的访问控制（RBAC: Role-Based Access Control)。就是基于用户(user)的角色(role)，以及其角色关联的权限(permission)、资源(resource)等，去做相应的访问控制，是目前应用最广泛的，也最容易实现的访问控制模型。

```
user---(n:m)---role----(m:p)---permission
user---(n:m)---role----(m:p)---permission---(p:q)---resource
user---(n:m)---roleGroup---(1:p)---role----(p:q)---permission---...
```

## 二、什么是ABAC
基于属性的访问控制（ABAC: Attribute-Based Access Control。就是基于用户(user)的属性（部门、职务、年龄等）去做访问控制，相比RBAC，ABAC更加灵活，理论上ABAC也可以实现基于角色的访问控制。

基于ABAC可以实现如下的访问控制:
- 当一个文档的所属部门跟用户的部门相同时，用户可以访问这个文档；
- 当用户是一个文档的拥有者并且文档的状态是草稿，用户可以编辑这个文档；
- 早上九点前禁止 A 部门的人访问 B 系统；
- 在除了上海以外的地方禁止以管理员身份访问 A 系统


可以看到ABAC要比RBAC要强大，但是ABAC没容易实现，难点在于如何使用用户的各种属性，去生成和应用访问控制规则，不像RBAC几张表查一下就完事了。实现ABAC生成、应用访问控制规则比较复杂，业界也没有统一的标准模型，各个公司都有自己的实现套路。


### 2.1 规则构成
ABAC的规则由以下五个东西组成：
- 对象：当前请求访问资源的用户
- 资源：对象要访问的资产或对象
- 操作：操作是对象试图对资源进行的动作。例如：增删改查等
- 环境：环境是当前时间、对象设备等相关信息
- 控制符：允许或拒绝对象操作资源


策略「早上9点前禁止 A 部门的人访问B系统」：
```
对象 = A 部门的人
资源 = B 系统
操作 = 访问
环境 = 时间是早上 9 点之前
空置符 = false
```
在早上9点前，A用户访问B系统时，触发这条，拒绝A部门的人访问请求

![](/assets/java/spring/权限控制RBAC、ABAC/1.png)


### 2.2 基于ABAC实现的项目
回头看看这些学一下
- https://www.authing.cn
- https://github.com/mostafa-eltaher/AbacSpringSecurity
- https://github.com/casbin/casbin
- https://github.com/casbin/jcasbin


## 三、两者优劣

ABAC:
- 优势：对于大型系统使用ABAC更加灵活，ABAC可扩展性更强、更方便、能够实现比RBAC粒度更细、更复杂的控制
- 劣势：实现起来比RBAC复杂

RBAC:
- 优势：对于中小型系统，维护角色和授权关系的工作量不大，使用RBAC成本更低
- 劣势：不够灵活

## 参考
- https://help.aliyun.com/document_detail/174235.html
- https://docs.authing.cn/v2/guides/access-control/abac.html
- https://www.bilibili.com/video/BV1wT411M7bd/


