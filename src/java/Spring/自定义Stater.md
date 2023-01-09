---
author: haya
title: 自定义Stater
date: 2021-09-09
article: true
timeline: true
category: java
tag:
- spring
---

## 一、依赖
```groovy
compile("org.springframework.boot:spring-boot-starter")
```

## 二、编写配置类
```java
@Data
@ConfigurationProperties("tosee.gms")
public class ToSeeGmsProperties {
    private String domain;
    private String appId;
    private String appSecret;
    private String serverUserId;
    private String logDomain;
}
```

## 三、配置AutoConfig类
启用ToSeeGmsProperties类，是的spring能够将配置属性注入进去。

然后使用读取到的配置信息，组装bean

```java
@Slf4j
@Configuration
// 启用ToSeeGmsProperties配置类
@EnableConfigurationProperties(ToSeeGmsProperties.class)
public class GmsAutoConfig {

    @Autowired
    private ToSeeGmsProperties properties;

    @Bean
    public GmsRetryHolder retryHolder() {
        return new GmsRetryHolder();
    }

    @Bean
    public GMSClient buildClient() {
       // ...
    }

}
```

会用到的注解：
```java
@Conditional：按照一定的条件进行判断，满足条件给容器注册bean
@ConditionalOnMissingBean：给定的在bean不存在时,则实例化当前Bean
@ConditionalOnProperty：配置文件中满足定义的属性则创建bean，否则不创建
@ConditionalOnBean：给定的在bean存在时,则实例化当前Bean
@ConditionalOnClass： 当给定的类名在类路径上存在，则实例化当前Bean
@ConditionalOnMissingClass ：当给定的类名在类路径上不存在，则实例化当前Bean
```


## 四、创建spring.factories
在resource目录下创建META-INF/spring.factories，内容如下：
```
org.springframework.boot.autoconfigure.EnableAutoConfiguration=com.xxx.GmsAutoConfig
```

## 五、配置hint
在resource目录下创建META-INF/additional-spring-configuration-metadata.json。内容参考：https://docs.spring.io/spring-boot/docs/current/reference/html/configuration-metadata.html

配置这个文件可以实现idea自动提示配置的功能


