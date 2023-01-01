---
author: haya
title: Linux内核参数
date: 2022-12-10
article: true
timeline: true
category: linux
tag:
- 内核参数
---
参考: https://help.aliyun.com/document_detail/41334.html

- 临时修改是使用sysctl [选项] [参数名=值]命令
- 永久修改是修改/etc/sysctl.conf或/proc/sys/目录下的对应文件。
> 例如，echo 0 > /proc/sys/net/ipv4/tcp_synack_retries）

## 1. net.ipv4.tcp_synack_retries
重发第二次握手报文（SYN+ACK）的次数，默认为5。

服务端在受到洪泛攻击时可以修改这个参数为0，可以加快回收半连接(syn-rcvd)，减少资源消耗。

## 2. net.ipv4.tcp_syn_retries
重发第一次握手报文（SYN）的次数，默认为5

## 3. net.ipv4.tcp_max_syn_backlog
半连接(syn-rcvd)队列长度，默认为1024。

加大该值可以容纳更多的等待状态的连接

## 4. net.ipv4.tcp_tw_reuse
TIME_WAIT状态的连接重用功能是否开启，默认为0。
- 1表示允许将TIME-WAIT sockets重新用于新的TCP连接
- 0表示关闭

## 5. net.ipv4.tcp_tw_recycle
默认为0
- 1表示开启TCP连接中TIME-WAIT sockets的快速回收
- 0，表示关闭

## 6. net.ipv4.tcp_fin_timeout
FIN_WAIT_2状态的超时时间，默认为60s。超时就收回

## 7. net.ipv4.tcp_syncookies
是否开启tcp_syncookies，默认为0，不开启。1表示开启，开启后，当出现SYN等待队列溢出时，启用cookies来处理，可防范少量SYN攻击

## 8. net.ipv4.ip_local_port_range
本机主动连接其他机器时的端口分配范围

## 9. fs.file-max
文件描述符最大数量



