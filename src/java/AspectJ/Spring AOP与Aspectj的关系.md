---
author: haya
title: Spring AOP与Aspectj的关系
date: 2022-05-12
article: true
timeline: true
category: java
tag:
- java
- spring
- aspectj

---

Spring AOP使用了AspectJ一样的注解，以及切入点声明DSL。但是Spring AOP没有使用AspectJ编译期处理注解并织入代码的方式去实现AOP，而是选择了自己在运行时通过动态代理实现的AOP：
- Spring 使用了和AspectJ 5一样的注解
- 使用AspectJ来做切入点解析和匹配
- AOP在运行时仍旧是纯的Spring AOP，并不依赖于AspectJ的编译器或者织入器（weaver）。