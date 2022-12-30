---
author: haya
title: Bean生命周期、扩展点
date: 2021-04-04
article: true
timeline: true
category: java
tag:
- java
- spring
---


## 生命周期
- 调用BeanFactoryPostProcessor的构造方法
- 调用BeanFactoryPostProcessor的postProcessBeanFactory方法
- 调用BeanPostProcessor的构造方法
- 调用InstantiationAwareBeanPostProcessor的构造方法
- 调用InstantiationAwareBeanPostProcessor的postProcessBeforeInstantiation方法
- 实例化bean，调用无参构造方法
- 调用InstantiationAwareBeanPostProcessor的postProcessAfterInstantiation方法
- 调用InstantiationAwareBeanPostProcessor的postProcessProperties方法
- 设置属性，调用populateBean
- 调用各种Aware接口的set方法
  - BeanNameAware
  - BeanFactoryAware
  - ApplicationContextAware
- 调用BeanPostProcessor的前置处理
- 调用@PostContruct的方法，**==此时bean已经完成了依赖注入==**
- 调用InitializingBean的afterPropertiesSet方法
- 调用BeanPostProcessor的后置处理
- 调用@PreDestroy
- 调用DisposableBean的destroy方法

https://www.bilibili.com/video/BV1UG411J7ic/?spm_id_from=0.0.header_right.history_list.click&vd_source=5ab9472a6568089968189c5d8d92da48