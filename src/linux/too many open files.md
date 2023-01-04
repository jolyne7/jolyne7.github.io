---
author: haya
title: too many open files
date: 2022-03-14
article: true
timeline: true
category: linux
tag:
- 文件描述符
---

查看当前限制最大文件打开数量
```shell
cat /proc/sys/fs/file-max
```
查询当前系统已打开的文件数量
```shell
cat /proc/sys/fs/file-nr
```
查询进程最大可打开文件数量及已
```shell
cat /proc/pid/limits 
```
查询进程已经打开文件数量
```shell
ls -l /proc/pid/fd/* | wc -l
```
修改进程最大打开文件数量
```shell
prlimit --pid xxx --nofile=655360:655360
```
修改系统最大可打开文件数量
```shell
echo 100000000 > /proc/sys/fs/file-max
```