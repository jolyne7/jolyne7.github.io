---
author: haya
title: 使用Java内置的观察者模式
date: 2019-05-12
article: true
timeline: true
category: java
tag:
- java
- 设计模式
---

## 一、什么是观察者模式
...
## 二、Java提供的观察者模式
Java提供了一个Observable类，顾名思义可知“可观察的”。当你有一个类需要被观察时，需要继承此类。

Java还提供了一个Observer接口，顾名思义可知“观察者”。当你有一个类需要观察别的类时，需要实现此接口。

## 三、如何使用Java提供的观察者模式
假设现在你有一个WeatherData的类，他是一个被观察的类，实例化后里面存储着测量到的天气数据{T,H,P}，每当天气数据变化时，里面的数据也会变。
```java
import java.util.Observable;

public class WeatherData extends Observable {
    private String T;
    private String H;
    private String P;
    
    public WeatherData() {}
}
```
现在你还有一个观察者类StatisticsDisplay，负责检测WeatherData 里的数据{T,H}，每当T,H改变时，StatisticsDisplay就输出更新后的值。
```java
import java.util.Observable;
import java.util.Observer;

public class StatisticsDisplay implements Observer{
    private String T;
    private String H;

    @Override
    public void update(Observable o, Object arg) {
        if (o instanceof WeatherData) {
            WeatherData weatherData = (WeatherData) o;
            this.T = weatherData.getT();
            this.H = weatherData.getH();
            this.toString();
        }
    }
    
    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder( "{" );
        sb.append( "\"T\":\"" )
                .append( T ).append( '\"' );
        sb.append( ",\"H\":\"" )
                .append( H ).append( '\"' );
        sb.append( '}' );
        return sb.toString();
    }
}
```

接下来就是建立被观察者与观察者之间的关系了，代码如下：

```java
    private Observable observable;
    public StatisticsDisplay(Observable observable) {
        this.observable = observable;
        observable.addObserver( this );
    }
```

在观察者类中添加一个参数是Observable的构造函数，在构造函数中调用addObserver将观察者作为参数添加进去。

最后就是在数据被修改后，被观察者通知观察者，(观察者的update（）会被调用)。代码如下：
```java
//在被观察者代码中添加如下代码：
public void measurementsChanged() {
    setChanged();
    notifyObservers();
}
public void setMeasurements(String T, String H, String P) {
    this.T = T;
    this.H = H;
    this.P = P;
    measurementsChanged();
}
```

如上，每次更改{T,H,P}后都会执行setChanged()和notifyObservers()，被观察者update(Observable o, Object arg) 会被执行。注意到第一个参数o是观察者，第二个参数是观察者执行notifyObservers()时传过来的数据，空则说明没有传。

## 四、测试
新建一个测试类，代码如下：
```java
public class WeatherStation {
    public static void main(String[] args){
        WeatherData weatherData = new WeatherData();
        StatisticsDisplay display = new StatisticsDisplay( weatherData );
        weatherData.setMeasurements( "1","2","3" );
        weatherData.setMeasurements( "2","3","4" );
        weatherData.setMeasurements( "3","4","5" );
        weatherData.setMeasurements( "4","5","6" );
    }
}
```
>结果：
```
{"T":"1","H":"2"}
{"T":"2","H":"3"}
{"T":"3","H":"4"}
{"T":"4","H":"5"}
```


# 五、完整代码
**WeatherData**
```java
import java.util.Observable;

public class WeatherData extends Observable {
    private String T;
    private String H;
    private String P;

    public WeatherData() {
    }

    public void measurementsChanged() {
        setChanged();
        notifyObservers();
    }

    public void setMeasurements(String T, String H, String P) {
        this.T = T;
        this.H = H;
        this.P = P;
        measurementsChanged();
    }
    public String getT() {
        return T;
    }

    public String getH() {
        return H;
    }

    public String getP() {
        return P;
    }
}

```
**StatisticsDisplay**
```java
import java.util.Observable;
import java.util.Observer;

public class StatisticsDisplay implements Observer,DisplayElement{
    private Observable observable;
    private String T;
    private String H;

    public StatisticsDisplay(Observable observable) {
        this.observable = observable;
        observable.addObserver( this );
    }

    @Override
    public void update(Observable o, Object arg) {
        if (o instanceof WeatherData) {
            WeatherData weatherData = (WeatherData) o;
            this.T = weatherData.getT();
            this.H = weatherData.getH();
            display();
        }
    }

    @Override
    public void display() {
        System.out.println( this.toString() );
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder( "{" );
        sb.append( "\"T\":\"" )
                .append( T ).append( '\"' );
        sb.append( ",\"H\":\"" )
                .append( H ).append( '\"' );
        sb.append( '}' );
        return sb.toString();
    }
}

```

**DisplayElement**
```java
public interface DisplayElement {
    void display();
}
```
**WeatherStation**
```java
public class WeatherStation {
    public static void main(String[] args){
        WeatherData weatherData = new WeatherData();
        StatisticsDisplay display = new StatisticsDisplay( weatherData );
        weatherData.setMeasurements( "1","2","3" );
        weatherData.setMeasurements( "2","3","4" );
        weatherData.setMeasurements( "3","4","5" );
        weatherData.setMeasurements( "4","5","6" );
    }
}
```