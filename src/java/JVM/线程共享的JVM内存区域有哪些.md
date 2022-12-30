---
author: haya
title: 线程共享的JVM内存区域有哪些
date: 2019-10-08
article: true
timeline: true
category: java
tag:
- java
- jvm

---

# 1.堆
几乎所有对象实例被分配到这里，也是垃圾收集器管理的主要区域。
Java堆可以被分为新生代和老生代。
进一步划分，则有Eden空间、From Survivor空间、To Survivor空间等。
无论如何划分，都是为了更好地回收内存、更快的分配内存。
# 2. 方法区
方法区由于存储虚拟机加载的类的信息、常量、静态变量、JIT编译后的代码等。
