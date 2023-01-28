---
author: haya
title: slf4j MDC应用
date: 2022-01-02
article: true
timeline: true
category: java
tag:

- slf4j
- mdc
- 日志

---

## 一、什么是MDC

映射诊断上下文【Mapped Diagnostic Context (MDC)】，MDC是对日志的扩展应用，它应该能够允许我们自定义想要展示在日志的信息，MDC在多线程环境下有很大的用处，可以管理每个线程的日志

MDC是slf4j提供的，具体的实现是由logback、log4j等日志库实现的。

## 二、应用

最简单的应用就是实现trace_id的透传

首先封装一下MDC的操作：
```java
public class MDCUtil {
    
    public static void put(String name, String value) {
        MDC.put(name, value);
    }

    public static String get(String name) {
        return MDC.get(name);
    }

    public static void remove(String name) {
        MDC.remove(name);
    }

    public static void clear() {
        MDC.clear();
    }
}
```

然后在Filter中取得http header中的traceId，设置到MDC中即可
```java
public class ServletLogFilter implements Filter{
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    public void doFilter(
            ServletRequest servletRequest,
            ServletResponse servletResponse,
            FilterChain filterChain
    ) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        String traceId = request.getHeader("TRACE_ID");
        if (traceId == null || "".equals(traceId)) {
            traceId = UUID.randomUUID().toString();
        }
        MDCUtil.put(MDCUtil.Type.TRACE_ID, traceId);
        filterChain.doFilter(servletRequest,servletResponse);
        MDCUtil.clear();
    }

    public void destroy() {

    }
}
```

配置logback-spring.xml
```xml
<configuration>
<!--    省略....-->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <layout class="ch.qos.logback.classic.PatternLayout">
            <Pattern>[%t] [%X{TRACE_ID}] - %m%n</Pattern>
        </layout>
    </appender>
    <root level="debug">
        <appender-ref ref="CONSOLE"/>
    </root>
</configuration>

```

[%X{TRACE_ID}] : 会去取当前线程threadLocal中TRACE_ID，并在日志中打印出来


## 三、MDC源码解读

MDC只是slf4j定义的一个规范，具体的实现由日志库负责。这里用到了适配器模式, MDC类的一些操作会转交给MDCAdapter接口的实现类去执行

MDC类：
```java
public class MDC {

    // ...省略
    static MDCAdapter mdcAdapter;

    public static void put(String key, String val) throws IllegalArgumentException {
        if (key == null) {
            throw new IllegalArgumentException("key parameter cannot be null");
        }
        if (mdcAdapter == null) {
            throw new IllegalStateException("MDCAdapter cannot be null. See also " + NULL_MDCA_URL);
        }
        mdcAdapter.put(key, val);
    }

    // ...省略
}
```

MDCAdapter：

```java
public interface MDCAdapter {

    public void put(String key, String val);

    public String get(String key);

    public void remove(String key);

    public void clear();

    public Map<String, String> getCopyOfContextMap();

    public void setContextMap(Map<String, String> contextMap);
}
```


MDCAdapter的实现类，这里以展示的是logback的LogbackMDCAdapter：
```java

public class LogbackMDCAdapter implements MDCAdapter {
    // 底层使用的是ThreadLocal
    final ThreadLocal<Map<String, String>> copyOnThreadLocal = new ThreadLocal();
    private static final int WRITE_OPERATION = 1;
    private static final int MAP_COPY_OPERATION = 2;
    final ThreadLocal<Integer> lastOperation = new ThreadLocal();

    // 省略...

    public void put(String key, String val) throws IllegalArgumentException {
        if (key == null) {
            throw new IllegalArgumentException("key cannot be null");
        } else {
            // 获取ThreadLocalMap中存储的map对象
            Map<String, String> oldMap = (Map)this.copyOnThreadLocal.get();
            Integer lastOp = this.getAndSetLastOperation(1);
            // 将put进来的kv键值对存放到map中
            if (!this.wasLastOpReadOrNull(lastOp) && oldMap != null) {
                oldMap.put(key, val);
            } else {
                // map为空时,新建一个map
                Map<String, String> newMap = this.duplicateAndInsertNewMap(oldMap);
                newMap.put(key, val);
            }

        }
    }

    private Map<String, String> duplicateAndInsertNewMap(Map<String, String> oldMap) {
        // 新建一个map
        Map<String, String> newMap = Collections.synchronizedMap(new HashMap());
        if (oldMap != null) {
            synchronized(oldMap) {
                newMap.putAll(oldMap);
            }
        }
        // 将map通过threadLocal存储到ThreadLocalMap中
        this.copyOnThreadLocal.set(newMap);
        return newMap;
    }
    // ...省略
}
```
