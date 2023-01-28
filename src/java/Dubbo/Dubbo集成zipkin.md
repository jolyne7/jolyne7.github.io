---
author: haya
title: Dubbo集成zipkin
date: 2022-09-04
article: true
timeline: true
category: java
tag:
- dubbo
- spring
- zipkin
- 链路追踪
---

## 一、依赖
```groovy
implementation 'org.springframework.cloud:spring-cloud-sleuth-zipkin:3.1.3'
implementation 'org.springframework.kafka:spring-kafka:2.9.0'
implementation 'io.zipkin.brave:brave-instrumentation-dubbo-rpc:5.13.11'
```

## 二、配置文件
配置trace日志发送到kafka
```yaml
spring:
  sleuth:
    # 启用sleuth
    enabled: true
    sampler:
      probability: 1
  zipkin:
    sender:
      type: kafka 
  #kafka配置
  kafka:
    bootstrap-servers: broker地址

dubbo:
  consumer:
    filter: 'tracing'
  provider:
    filter: 'tracing'
```

