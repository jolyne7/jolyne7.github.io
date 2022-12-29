---
author: haya
title: 使用Java内置的动态代理模式
date: 2019-06-16
article: true
timeline: true
category: java
tag:
- java
- 设计模式

---

## 一、什么是动态代理
利用反射机制生成一个实现代理接口的匿名类，在调用具体方法前调用InvokeHandler来处理。即动态的生成静态代理
## 二、先讲讲静态代理
假设现在我们有一个Animal接口和其一个实现类Cat，代码如下
Animal:
```java
public interface Animal {
    void eat();
    void run();
}
```
Cat:
```java
public class Cat implements Animal {
    @Override
    public void eat() {
        System.out.println( "吃鱼" );
    }

    @Override
    public void run() {
        System.out.println( "猫步" );
    }
}
```
现在有一个要求，规定在不修改Animal和Cat的代码的情况下，仅将Cat的eat函数的输出改为“吃屎”。
这里你可以使用**静态代理**模式，实现起来也比较简单，代码如下：
```java
public class CatProxy implements Animal {
	Cat obj=null;
	CatProxy(Cat obj){
		this.obj = obj;
	}
    @Override
    public void eat() {
        System.out.println( "吃屎" );
    }

    @Override
    public void run() {
        obj.run();
    }
}
```
但是静态代理有一个缺点，就是当Cat类中的函数很多时，假设有100个，我只想修改其中1个，就仍需要在CatProxy中调用其他99个不会被修改的函数。而且当修改Animal接口时，不仅要修改Cat类，还需要修改CatProxy类。如此看来，静态代理虽然简单，但一旦遇到稍微复杂的地方，就变得十分冗余繁琐，不易维护。

## 三、如何使用Java提供的动态代理模式
还是Animal接口和Cat类：

Animal:
```java
public interface Animal {
    void eat();
    void run();
}
```
Cat:
```java
public class Cat implements Animal {
    @Override
    public void eat() {
        System.out.println( "吃鱼" );
    }

    @Override
    public void run() {
        System.out.println( "猫步" );
    }
}
```
接下来使用Java提供的动态代理，新建一个CatInvoc类，并实现InvocationHandler接口，代码如下：
```java
public class CatInvoc implements InvocationHandler {
    private Animal obj;

    public CatInvoc(Animal obj) {
        this.obj = obj;
    }
    /**
     * @param proxy 不怎么用
     * @param method 函数对象
     * @param args 参数
     * @return 
     * @throws Throwable
     */
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        Object invoke = null;
      
        return invoke;
    }
}
```
还是刚刚那个需求，仅将Cat的eat函数的输出改为“吃屎”，代码如下：
```java
@Override
public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    Object invoke = null;
    if ("eat".equals( method.getName() )) {
        System.out.println( "吃屎" );
    } else {
        invoke = method.invoke( obj, args );
    }
    return invoke;
}
```
这里通过method.getName()获取函数名，当函数名为eat时，执行System.out.println( "吃屎" )。其他情况时则执行invoke = method.invoke( obj, args )，正常执行被代理对象的函数。
接下来新建一个CatProxy类，代码如下：
```java
import java.lang.reflect.Proxy;

public class CatProxy {
    Animal getAnimal(Animal animal) {
        return (Animal) Proxy.newProxyInstance( 
        		animal.getClass().getClassLoader(),
                animal.getClass().getInterfaces(),
                new CatInvoc( animal ) );
    }
}
```
getAnimal()用于返回一个代理对象。Proxy.newProxyInstance(类加载器，接口，invoc对象)通过反射创建出一个代理对象，不难看出动态代理的本质就是动态的生成静态代理。