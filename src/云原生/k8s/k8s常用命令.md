---
author: haya
title: k8s常用命令
date: 2021-10-02
article: true
timeline: true
category: 云原生
tag:
- k8s
---

## kubectl get po
查看当前所在命名空间的pod

## kubectl get po -n 命名空间
查看指定命名空间的pod

## kubectl get po -A
查看所有命名空间的pod

## kubectl describe po
查看pod详情

## kubectl create namespace
用来创建namespace的

## kubectl edit
用来编辑pod、config、service、deployment等

## kubectl delete
用来删除pod、config、service、deployment等

## kubectl logs 
用来查看pod的logs

## kubectl apply -f
用来应用k8s yaml文件的

## kubectl exec 
跟docker的exec一样，进容器用的

## kubectl cp
拷贝容器内的文件到本地：
```shell
kubectl cp 命名空间/pod名:路径 目标路径
```
拷贝本地文件到容器内：
```shell
kubectl cp 路径 命名空间/pod名:目标路径
```


