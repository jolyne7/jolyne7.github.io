---
author: haya
title: CGlib动态代理
date: 2019-06-16
article: true
timeline: true
category: java
tag:
- java
- 设计模式
---

```xml
<dependency>
  <groupId>cglib</groupId>
  <artifactId>cglib-nodep</artifactId>
  <version>3.3.0</version>
</dependency>
```

CGLIB 动态代理代理有两个核心的类：MethodInterceptor、Enhancer。MethodInterceptor类似于上述的InvocationHandler，Enhancer类似于Proxy。

```java
public class DynamicInterceptor implements MethodInterceptor {

    /**
     * @param o 表示原始类
     * @param method 表示被拦截的方法
     * @param objects 数组表示参数列表，基本数据类型需要传入其包装类型，如int-->Integer、long-Long、double-->Double
     * @param methodProxy 表示对方法的代理，invokeSuper方法表示对原始对象方法的调用
     * @return 执行结果
     * @throws Throwable
     */
    @Override
    public Object intercept(
            Object o, 
            Method method, 
            Object[] objects, 
            MethodProxy methodProxy
    ) throws Throwable {
        long startTimestamp = System.currentTimeMillis();

        // 注意这里是调用 invokeSuper 而不是 invoke，否则死循环，
        // methodProxy.invokeSuper执行的是原始类的方法，
        // method.invoke执行的是子类的方法
        Object result = methodProxy.invokeSuper(o, objects);

        long endTimeStamp = System.currentTimeMillis();

        long responseTime = endTimeStamp - startTimestamp;

        System.out.printf("method:%s, startTime:%s, responseTime:%s", method.getName(), startTimestamp, responseTime);

        return result;
    }

}
```

UserServiceImpl
```java

public class UserServiceImpl {

    public void login(String username, String password) {
        System.out.println("欢迎" + username + "登录！");
    }

}
```

测试：
```java
public class DynamicProxyDemo {
    public static void main(String[] args) {
        var interceptor = new DynamicInterceptor();

        var enhancer = new Enhancer();
        // 设置超类，cglib是通过继承来实现的
        enhancer.setSuperclass(UserServiceImpl.class);
        enhancer.setCallback(interceptor);
        // 创建代理类
        var userService = (UserServiceImpl)enhancer.create();
        userService.login("haya", "1024");
    }
}
```

## JDK 动态代理 和 CGLIB动态代理 的对比

- JDK动态代理：基于Java反射机制实现，必须要实现了接口的业务类才能用这种办法生成代理对象。
- cglib动态代理：基于ASM机制实现，通过生成业务类的子类作为代理类

JDK动态代理优势：无额外依赖，JDK 本身的支持，兼容性可靠性更好

cglib动态代理优势：目标类无需实现接口，可以做到无侵入式代理