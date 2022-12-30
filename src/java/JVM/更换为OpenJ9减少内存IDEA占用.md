---
author: haya
title: 更换为OpenJ9减少内存IDEA占用
date: 2021-02-28
article: true
timeline: true
category: java
tag:
- java
- jvm

---

实测idea在使用openJ9的情况下，即使不优化jvm参数也比idea自带的jdk占内存要低不少

openJ9：[下载链接](https://www.injdk.cn/)

![./openJ9-download.png](/assets/java/jvm/openJ9-download.png)

下载完成后，解压并替换掉IDEA安装目录下的jbr文件夹

解压后试试能否打开你的IDEA，不能打开的话可能是一些plugin不兼容的问题。

> 同理，将本地项目的jdk替换成openJ9，也可以减少内存占用