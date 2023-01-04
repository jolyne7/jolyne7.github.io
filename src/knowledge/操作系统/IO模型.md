---
author: haya
title: IO模型
date: 2021-03-01
article: true
timeline: true
category: 基础知识
tag:
- 操作系统
- IO模型
---

## 一、阻塞式 I/O
![](/assets/knowledge/操作系统/IO模型/1.png)

## 二、非阻塞式 I/O
不断的执行系统调用来获知 I/O 是否完成，这种方式称为轮询(polling):
![](/assets/knowledge/操作系统/IO模型/2.png)

## 三、I/O 多路复用
使用 select、poll、epoll等待数据，并且可以同时等待多个Socket。当有socket就绪时，再将socket拷贝到用户态给进程处理。

它可以让单个进程具有处理多个 I/O 事件的能力。又被称为 Event Driven I/O，即事件驱动 I/O。

如果一个 Web 服务器没有 I/O 复用，那么每一个 Socket 连接都需要创建一个线程去处理。如果同时有几万个连接，那么就需要创建相同数量的线程。并且相比于多进程和多线程技术，I/O 复用不需要进程线程创建和切换的开销，系统开销更小。

![](/assets/knowledge/操作系统/IO模型/3.png)

### 3.1 select
将已连接的Socket都放到一个文件描述符集合(fd_set)，然后调用 select 函数将文件描述符集合==拷贝==到内核里，让内核来检查是否有网络事件产生。
>fd_set底层是一个二进制数组实现的位图(bitmap)，这个数组是FD_SETSIZE=1024(不能修改)。通过0、1表示对应的文件描述符的读写状态。

检查的方式很粗暴，就是通过遍历文件描述符集合的方式，当检查到有事件产生后，将此 Socket 标记为可读或可写，然后把整个文件描述符集合==拷贝==到用户态的进程里，然后进程还需要再遍历一遍找到可读可写的socket。

可以看到，使用select需要遍历两次socket的文件描述符集合，一次在内核态、一次在用户态。和需要两次文件描述符的拷贝。


### 3.2 poll

poll跟select相似，只不过不再使用固定大小的二进制数组来实现fd_set，取而代之的是使用pollfd结构体组成的链表。

打破了select处理socket数量的上线，但依然会受制于操作系统的文件描述符数量限制。

但是没有改善两次O(n)级别的文件描述符遍历，以及两次拷贝。

### 3.3 epoll

与select的数组、poll链表不同，epoll使用的是红黑树维护所有socket文件描述符。相比较于数组、链表的线性结构，树形结构在增删改查的时间复杂度方面具有明显的优势，其时间复杂度为O(log n)。

为了减少每次拷贝的数据量，epoll使用了事件驱动，每当有一个socket就绪，就会把它加入到就绪队列中。当用户态调用epoll_wait()时，只需要拷贝已就绪的socket到用户态就行。

因此相比较于select\poll，在Socket增多的时候，epoll的效率不会有明显的下降。

#### 3.3.1 边缘触发ET(edge-triggered)
当被监控的 Socket 描述符上有可读事件发生时，用户态进程只会从 epoll_wait 中苏醒一次
>边缘触发的效率比水平触发的效率要高，因为边缘触发可以减少 epoll_wait 的系统调用次数
#### 3.3.2 水平触发LT(level-triggered)
当被监控的 Socket 上有可读事件发生时，用户态进程会不断地从 epoll_wait 中苏醒，直到内核缓冲区数据被 read 函数读完才结束

## 四、信号驱动 I/O
使用 sigaction 系统调用，内核立即返回，应用进程可以继续执行。内核在数据到达时向应用进程发送 SIGIO 信号，应用进程收到之后在信号处理程序中调用 recvfrom 将数据从内核复制到应用进程中。

![](/assets/knowledge/操作系统/IO模型/4.png)


## 五、异步 I/O
使用aio_read 系统调用会立即返回，应用进程继续执行，不会被阻塞，内核会在所有操作完成之后向应用进程发送信号。

异步 I/O 与信号驱动 I/O 的区别在于，异步 I/O 的信号是通知应用进程 I/O 完成，而信号驱动 I/O 的信号是通知应用进程可以开始 I/O。


![](/assets/knowledge/操作系统/IO模型/5.png)


## 六、Reactor
对 I/O 多路复用作了一层封装，让使用者不用考虑底层网络 API 的细节，只需要关注应用代码的编写。这就是Reactor 模式，也叫 Dispatcher 模式，即 I/O 多路复用监听事件，收到事件后，根据事件类型分配（Dispatch）给某个进程 / 线程。

Reactor 模式主要由 Reactor 和处理资源池这两个核心部分组成，它俩负责的事情如下：
- Reactor: 负责监听和分发事件，事件类型包含连接事件、读写事件
- 处理资源池: 负责处理事件，如 read -> 业务逻辑 -> send

Reactor 模式是灵活多变的，其可以是:
- 单 Reactor 单进程 / 单线程
- 单 Reactor 多进程 / 多线程
- 多 Reactor 单进程 / 单线程(没有优势，不做讨论)
- 多 Reactor 多进程 / 多线程


### 6.1 单 Reactor 单进程 / 单线程
![](/assets/knowledge/操作系统/IO模型/6.png)

可以看到进程里有 Reactor、Acceptor、Handler 这三个对象：
- Reactor 对象的作用是监听和分发事件；
- Acceptor 对象的作用是获取连接；
- Handler 对象的作用是处理业务

这种方案存在 2 个缺点：
- 因为只有一个进程或线程，无法充分利用 多核 CPU 的性能；
- Handler 对象在业务处理时，整个进程是无法处理其他连接的事件的，如果业务处理耗时比较长，那么就造成响应的延迟

### 6.2 单 Reactor 多线程 / 多进程
为了解决单 Reactor 单进程 / 线程的缺点，引入多线程、进程：

![](/assets/knowledge/操作系统/IO模型/7.png)

可以看到Handler 对象不再负责业务处理，只负责数据的接收和发送，Handler 对象通过 read 读取到数据后，会将数据发给子线程里的 Processor 对象进行业务处理

子线程里的 Processor 对象就进行业务处理，处理完后，将结果发给主线程中的 Handler 对象，接着由 Handler 通过 send 方法将响应结果发送给 client

### 6.3 多 Reactor 多进程 / 多线程

单Reactor有一个问题就是，单个Reactor既负责连接的建立、有负责事件的分发，当大量连接建立时，单个Reactor就会无暇顾及事件的分发了。单个Reactor容易成为性能瓶颈，所以引入了多Reactor：

![](/assets/knowledge/操作系统/IO模型/8.png)

可以看到：
- MainReactor通过 select 监控连接建立事件，收到事件后通过 Acceptor 对象中的 accept 获取连接，将新的连接分配给某个子线程；
- SubReactor将 MainReactor分配的连接加入 select 继续进行监听，并创建一个 Handler 用于处理连接的响应事件。
- 如果有新的事件发生时，SubReactor会调用当前连接对应的 Handler 对象来进行响应。
- Handler通过 read -> 业务处理 -> send 的流程来完成完整的业务流程

这样一来分工明确，MainReactor只负责接收新连接，SubReactor只负责分发IO业务处理

