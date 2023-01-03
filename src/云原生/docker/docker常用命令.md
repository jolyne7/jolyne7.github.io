---
author: haya
title: docker常用命令
date: 2021-09-20
article: true
timeline: true
category: 云原生
tag:
- docker
---


## docker ps
查看正在运行的容器

## docker ps -a	
查看所有已经创建的容器

## docker images
列出镜像列表

## docker rm
删除容器

## docker rmi
删除镜像

## docker cp
容器与主机之间的数据拷贝
> docker cp  容器名:路径 目标路径

## docker start	
启动容器

## docker stop	
停止容器

## docker exec
进入容器
> docker exec -it 容器名 sh

## docker pull	
拉取镜像

## docker push
推送镜像

## docker login
登录私有docker镜像仓库

## docker logs 
查看容器的日志

## docker save
保存容器成 tar 文件

## docker load 
导入docker save的文件

## docker top
查看容器中运行的进程信息，支持 ps 命令参数

