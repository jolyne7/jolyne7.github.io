---
author: haya
title: Dubbo SPI
date: 2023-01-28
article: true
timeline: true
category: java
tag:
- dubbo
- spi
---

## 一、Dubbo SPI与Java SPI的不同

- Dubbo SPI配置文件的目录是在/META-INF/dubbo、/META-INF/dubbo/internal/ 下，Java SPI则在/META-INF/services/
- Dubbo SPI配置文件中每一行写的是kv结构（扩展名=全类名），Java SPI则是全类名

## 二、为什么Dubbo使用KV声明SPI文件

下面是dubbo源码中的例子

/META-INF/dubbo/internal/org.apache.dubbo.rpc.protocol.tri.compressor.Compressor
```
gzip=org.apache.dubbo.rpc.protocol.tri.compressor.Gzip
bzip2=org.apache.dubbo.rpc.protocol.tri.compressor.Bzip2
snappy=org.apache.dubbo.rpc.protocol.tri.compressor.Snappy
```

可以看到一个Compressor接口拥有三个实现类，如果用Java SPI加载的话，这三个实现类都会被实例化，而实际情况中只会使用一个实现类，那就会有两个类的对象没有用武之地，就是浪费。而使用Dubbo SPI的话，只需要指定扩展名，就可以只加载对应的实现类，这样就不会浪费内存了。

> 为什么不直接在代码里做判断，然后实例化对应的类？
> 
> 说到底还是开闭原则。如果在代码里做判断，实例化对应的类，那么别人想扩展也没法直接扩展了。


## 三、@SPI
这个注解是用来声明扩展点的，如下所示：
```java
// 标注这个接口是个扩展点
@SPI(scope = ExtensionScope.FRAMEWORK)
public interface Compressor extends MessageEncoding {

    Compressor NONE = Identity.IDENTITY;

    static Compressor getCompressor(FrameworkModel frameworkModel, String compressorStr) {
        if (null == compressorStr) {
            return null;
        }
        if (compressorStr.equals(Identity.MESSAGE_ENCODING)) {
            return NONE;
        }
        // 根据扩展名获取Compressor指定的实现类
        // 底层会执行创建ExtensionLoader对象等操作，这里不做过多讲解
        return frameworkModel.getExtensionLoader(Compressor.class).getExtension(compressorStr);
    }
    // ...
}
```

## 四、@Activate
这个注解是用来做适配的，只有在满足@Activate注解里面的参数时，被@Activate修饰的类才会生效

例如下面的ExceptionFilter，只有在作为服务提供者时才会生效。
```java
@Activate(group = CommonConstants.PROVIDER)
public class ExceptionFilter implements Filter, Filter.Listener {
    // ...
}
```


## 五、@Adaptive

！！TODO，八嘎 看不懂这个注解咋用

https://www.jianshu.com/p/c16aed0b4181

