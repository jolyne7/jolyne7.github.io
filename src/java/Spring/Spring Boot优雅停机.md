---
author: haya
title: Spring Boot优雅停机
date: 2021-09-15
article: true
timeline: true
category: java
tag:
- k8s
- spring
- 优雅停机
---

## 一、为什么需要优雅停机？

在更新后端服务时，肯定是希望旧版本服务切新版本服务的时候服务不间断。

首先肯定是需要让新版本服务和旧版本服务同时运行，然后将请求都转移到新版本服务上。

此时旧版本服务就不会接收到任何请求了，那么此时是要立刻关闭旧版本服务呢，还是等一会在关闭呢？

显然是等一会在关闭，因为旧版本服务中可能还存在部分用户的请求没有处理完，此时如果关闭，用户那边就会报错，因此不能立刻关闭。

那就只能让旧服务等一会再关闭了，这就是优雅停机

## 二、Spring Boot提供的优雅停机

依赖：

```groovy
implementation 'org.springframework.boot:spring-boot-starter-actuator'
```

配置文件：

```yaml
spring:
  # 停机过程超时时长设置了20s，超过20s，直接停机
  lifecycle:
    timeout-per-shutdown-phase: 20s

server:
  port: 8080
  # GRACEFUL表示优雅关机
  shutdown: graceful

management:
  server:
    address: 127.0.0.1
    port: 8081
  endpoint:
    shutdown:
      enabled: true
  endpoints:
    web:
      base-path: /endpoint
      exposure:
        include: health,shutdown
```

在服务切换时调用127.0.0.1:8081/endpoint/shutdown，系统会给JVM发送SIGTERM信号，服务就会进入优雅停机状态，等待做多
timeout-per-shutdown-phase配置的秒数后，发送SIGKILL终止进程。

## 二、k8s环境下的优雅停机

k8s给pod也提供了一样的等待、超时、kill掉的策略。

可以和Spring Boot的优雅停机策略搭配只用，因为k8s的策略是给容器进程发送的SIGTERM信号，而不是JVM进程，要想给JVM优雅停机就需要使用Spring Boot的策略。这里是通过在k8s preStop时调用Spring Boot的shutdown接口来实现的。
> 需要注意的一点是terminationGracePeriodSeconds要比timeout-per-shutdown-phase

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: A-Server
spec:
  template:
    spec:
      # 等待60s
      terminationGracePeriodSeconds: 60
      containers:
        lifecycle:
          preStop:
            exec:
              command: [ "curl", "-X", "POST", "127.0.0.1:8081/endpoint/shutdown" ]
```



