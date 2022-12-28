---
author: haya
title: AspectJ DSL
date: 2022-05-13
article: true
timeline: true
category: java
tag:
- java
- aspectj

---

偶然间发现的一个玩意，aspectj有一套兼容java语法的dsl能够实现aop。写的时候是.aj文件，编译期会编译成class文件。

## demo

这里用的gradle, 只在编译期使用到了aspectj，所以就compileOnlyApi
```groovy
compileOnlyApi 'org.aspectj:aspectjrt:1.9.6'
```

同时，配置一下插件

```groovy
plugins {
    // ...
    id "io.freefair.aspectj.post-compile-weaving" version "5.3.3.3"
}
```

配置.aj文件所在目录, 然后再编译期就会将aj文件编译成class文件
```groovy
compileJava {
    ajc {
        options {
            aspectpath.setFrom configurations.aspect
            compilerArgs = ["-sourceroots", "../../../src/main/java/org/haya/core/aspect"]
        }
    }
}
```


.aj文件
```aspectj

public aspect ProfilesAnnoAspect {
    
    // 声明切点
    pointcut all():execution(* *(..));

    pointcut profilesAnnotation(org.haya.core.anno.profile.anno.ProfileList profilesAnnotation): @annotation(profilesAnnotation);


    // before
    before(org.haya.core.anno.profile.anno.ProfileList annotation): all() && profilesAnnotation(annotation){
        // ...
    }


    // after
    after(org.haya.core.anno.profile.anno.ProfileList annotation): all() && profilesAnnotation(annotation){
       // ...
    }
}
```