---
author: haya
title: SPI
date: 2021-07-01
article: true
timeline: true
category: java
tag:
- java
- spi
---

指定实现类用的，dubbo里经常用到

## 实例

先定义一个接口
```java
public interface JavaMateJsonHandler {
    String toJson(Object obj);
}
```

在定义一个实现类,这里用fastjson实现一下这个接口
```java
@AutoService(JavaMateJsonHandler.class)
public class JsonHandler implements JavaMateJsonHandler {
    public  String toJson(Object obj) {
        return JSON.toJSONString(obj);
    }
}
```

@AutoService是谷歌的一个包提供的注解，作用是在编译期在resource目录下生成/META-INF/services/接口名 的文件,文件内容是接口的实现类。

当然也可以不用这个注解，直接手动创建这个文件:

> resources/META-INF/services/com.haya.mate.core.spi.JavaMateJsonHandler
```
com.haya.mate.example.spi.JsonHandler
```

有了这个文件后，就可以用ServiceLoader去加载并实例化实现类了

```java
public class JavaMateJsonService {
    private static  JavaMateJsonHandler handler = null;
    static {
        ServiceLoader<JavaMateJsonHandler> loader = ServiceLoader.load(JavaMateJsonHandler.class);
        for (JavaMateJsonHandler item : loader) {
            handler = item;
            break;
        }
    }


    public static String toJson(Object obj) {
        return handler.toJson(obj);
    }
}
```