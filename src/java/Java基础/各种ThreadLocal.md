---
author: haya
title: 各种ThreadLocal
date: 2023-01-13
article: true
timeline: true
category: java
tag:
- 线程
- threadlocal
---

## 一、ThreadLocal

ThreadLocal大家都知道是线程内部传递变量的、一般用在用户信息传递，traceId传递、数据库事务控制等功能的实现上。

使用起来非常简单
```java
// 新建ThreadLocal
var threadLocal = new ThreadLocal<String>();
// 可以在当前业务线程生命周期运行的各个位置运行get、set方法存取值
threadLocal.set("hahaha");
var v = threadLocal.get();
// 有线程复用的情况的话一定要在线程处理任务结束时remove，防止内存泄漏或下个线程获取这个值造成bug
threadLocal.remove();
```

### 1.1 ThreadLocalMap

每个线程都有一个ThreadLocalMap，在调用ThreadLocal的get、set方法时，回去获取当前线程的ThreadLocalMap，并从中存取值。

```java
// threadlocal内部获取threadLocalMap
Thread t = Thread.currentThread();
ThreadLocalMap map = getMap(t);
```

ThreadLocalMap是一个哈希表，与jdk的HashMap不同，ThreadLocalMap实现比较简单，没有用链地址法解决hash冲突，也没有红黑树，而是使用线性探测法。

## 二、InheritableThreadLocal
ThreadLocal只适用于当前线程内部变量传递，如果要在父子线程传递内部变量就需要用到InheritableThreadLocal。子线程可以通过InheritableThreadLocal获取父线程的内部变量。

### 2.1 InheritableThreadLocalMap
每个线程其实有两个ThreadLocal对象，一个叫threadLocals，另一个叫inheritableThreadLocals。其中threadLocals用来实现当前线程内部变量传递的，inheritableThreadLocals用来实现父子线程传递内部变量的。

关键代码如下：
```java
// thread类在实例化时，会判断父线程的inheritableThreadLocals是否是null
if (inheritThreadLocals && (null != parentThread.inheritableThreadLocals)) {
    // 不等于null，就拿过来直接用
    inheritableThreadLocals = ThreadLocal.createInheritedMap(parentThread.inheritableThreadLocals);
}
```

拿到了父线程的inheritableThreadLocals就好办了，InheritableThreadLocal每次从InheritableThreadLocal get就能实现父线程向子线程共享内部变量的作用了。

> !! createInheritedMap是深拷贝，子线程修改inheritableThreadLocals，影响不到父线程的

## 三、FastThreadLocal
FastThreadLocal是netty实现的thread，在一个线程有大量内部变量时，读写效率会比JDK自带的ThreadLocal高

> netty不仅实现了自己的FastThreadLocal，还实现了自己的ThreadLocalMap、FastThreadLocalThread（netty封装的线程）,这几个要搭配起来使用，不能与JDK原生的混用

### 3.1 为什么比ThreadLocal快
因为JDK的ThreadLocalMap用的是hash表，在有大量threadLocal的时候就会有hash冲突，这就影响读写内部变量的效率了。

Netty的ThreadLocalMap内部用的不是hash表，而是用数组直接存的内部变量。每个FastThreadLocal会维护一个index属性，记录自己在数组种的位置。读场景下，根据FastThreadLocal的index属性直接从数组获取值；写场景下index+1分配给新的FastThreadLocal。这样就省去计算hashcode、数组下标索引、hash冲突的操作，效率上会比jdk的要高。

> 使用上与jdk的没啥区别



## 四、TransmittableThreadLocal
这个是阿里开源的一个ThreadLocal实现。用于向线程池里的线程传递内部变量用的。


```
Main线程 {
    线程A
    
    ---线程池
    线程1
    线程2
    线程3
    ---
}
```
看上面这个场景，线程A在使用线程池时，想把值传递给线程池里的线程，此时用JDK提供的ThreadLocal、InheritableThreadLocal都无法实现，因为ThreadLocal只管当前线程、InheritableThreadLocal只管父子线程。显然线程A与线程池里的线程都不属于这种关系。

> 具体使用参考官方github readme: https://github.com/alibaba/transmittable-thread-local

实现原理大概思路就是：
- 将TransmittableThreadLocal和它的值存到map中
- 然后使用装饰器模式包装Runnable类(TtlRunnable)
- TtlRunnable获得map的引用，并在runnable的run方法运行前将map中的值set到当前线程中，并保存set之前的备份
- runnable的run方法执行完后，根据set之前的备份








