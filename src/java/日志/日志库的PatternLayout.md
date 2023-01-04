---
author: haya
title: 日志库的PatternLayout
date: 2022-01-03
article: true
timeline: true
category: java
tag:
- 日志
- PatternLayout
---

PatternLayout就是定义日志打印格式的玩意，logback、log4j的PatternLayout应该都是通用的

##

<table border="1" cellspacing="0" cellpadding="0" align="center">
<tbody>
    <tr>
        <th width="9%" height="27">参数</th>
        <th height="27">说明</th>
        <th colspan="2" height="27">例子</th>
    </tr>
    <tr>
        <td rowspan="9" bgcolor="#33ccff" height="200">%c</td>
        <td rowspan="9" bgcolor="#ffccff" height="200">列出logger名字空间的全称，如果加上{&lt;层数&gt;}表示列出从最内层算起的指定层数的名字空间</td>
        <td height="32">log4j配置文件参数举例</td>
        <td height="32">输出显示媒介</td>
    </tr>
    <tr>
        <td colspan="2" bgcolor="#ff9966" height="16">假设当前logger名字空间是"a.b.c"</td>
    </tr>
    <tr>
        <td bgcolor="#33ff99" height="16">%c</td>
        <td bgcolor="#33ff99" height="16">a.b.c</td>
    </tr>
    <tr>
        <td height="16">%c{2}</td>
        <td height="16">b.c</td>
    </tr>
    <tr>
        <td bgcolor="#33ff99" height="16">%20c</td>
        <td bgcolor="#33ff99" height="16">（若名字空间长度小于20，则左边用空格填充）</td>
    </tr>
    <tr>
        <td height="16">%-20c</td>
        <td height="16">（若名字空间长度小于20，则右边用空格填充）</td>
    </tr>
    <tr>
        <td bgcolor="#33ff99" height="16">%.30c</td>
        <td bgcolor="#33ff99" height="16">（若名字空间长度超过30，截去多余字符）</td>
    </tr>
    <tr>
        <td height="32">%20.30c</td>
        <td height="32">（若名字空间长度小于20，则左边用空格填充；若名字空间长度超过30，截去多余字符）</td>
    </tr>
    <tr>
        <td bgcolor="#33ff99" height="32">%-20.30c</td>
        <td bgcolor="#33ff99" height="32">（若名字空间长度小于20，则右边用空格填充；若名字空间长度超过30，截去多余字符）</td>
    </tr>
    <tr>
        <td rowspan="3" bgcolor="#33ccff" height="50">%C</td>
        <td rowspan="3" bgcolor="#ffccff" height="50">列出调用logger的类的全名（包含包路径）</td>
        <td colspan="2" bgcolor="#ff9966" height="16">假设当前类是"org.apache.xyz.SomeClass"</td>
    </tr>
    <tr>
        <td bgcolor="#33ff99" height="16">%C</td>
        <td bgcolor="#33ff99" height="16">org.apache.xyz.SomeClass</td>
    </tr>
    <tr>
        <td height="16">%C{1}</td>
        <td height="16">SomeClass</td>
    </tr>
    <tr>
        <td rowspan="4" bgcolor="#33ccff" height="83">%d</td>
        <td rowspan="4" bgcolor="#ffccff" height="83">显示日志记录时间，{&lt;日期格式&gt;}使用ISO8601定义的日期格式</td>
        <td bgcolor="#33ff99" height="32">%d{yyyy/MM/dd HH:mm:ss,SSS}</td>
        <td bgcolor="#33ff99" height="32">2005/10/12 22:23:30,117</td>
    </tr>
    <tr>
        <td height="16">%d{ABSOLUTE}</td>
        <td height="16">22:23:30,117</td>
    </tr>
    <tr>
        <td bgcolor="#33ff99" height="16">%d{DATE}</td>
        <td bgcolor="#33ff99" height="16">12 Oct 2005 22:23:30,117</td>
    </tr>
    <tr>
        <td height="16">%d{ISO8601}</td>
        <td height="16">2005-10-12 22:23:30,117</td>
    </tr>
    <tr>
        <td bgcolor="#33ccff" height="16">%F</td>
        <td bgcolor="#ffccff" height="16">显示调用logger的源文件名</td>
        <td bgcolor="#33ff99" height="16">%F</td>
        <td bgcolor="#33ff99" height="16">MyClass.java</td>
    </tr>
    <tr>
        <td bgcolor="#33ccff" height="32">%l</td>
        <td bgcolor="#ffccff" height="32">输出日志事件的发生位置，包括类目名、发生的线程，以及在代码中的行数</td>
        <td height="32">%l</td>
        <td height="32">MyClass.main(MyClass.java:129)</td>
    </tr>
    <tr>
        <td bgcolor="#33ccff" height="16">%L</td>
        <td bgcolor="#ffccff" height="16">显示调用logger的代码行</td>
        <td bgcolor="#33ff99" height="16">%L</td>
        <td bgcolor="#33ff99" height="16">129</td>
    </tr>
    <tr>
        <td bgcolor="#33ccff" height="16">%m</td>
        <td bgcolor="#ffccff" height="16">显示输出消息</td>
        <td height="16">%m</td>
        <td height="16">This is a message for debug.</td>
    </tr>
    <tr>
        <td bgcolor="#33ccff" height="16">%M</td>
        <td bgcolor="#ffccff" height="16">显示调用logger的方法名</td>
        <td bgcolor="#33ff99" height="16">%M</td>
        <td bgcolor="#33ff99" height="16">main</td>
    </tr>
    <tr>
        <td bgcolor="#33ccff" height="32">%n</td>
        <td bgcolor="#ffccff" height="32">当前平台下的换行符</td>
        <td height="32">%n</td>
        <td height="32">Windows平台下表示rn<br>UNIX平台下表示n</td>
    </tr>
    <tr>
        <td bgcolor="#33ccff" height="16">%p</td>
        <td bgcolor="#ffccff" height="16">显示该条日志的优先级</td>
        <td bgcolor="#33ff99" height="16">%p</td>
        <td bgcolor="#33ff99" height="16">INFO</td>
    </tr>
    <tr>
        <td bgcolor="#33ccff" height="16">%r</td>
        <td bgcolor="#ffccff" height="16">显示从程序启动时到记录该条日志时已经经过的毫秒数</td>
        <td height="16">%r</td>
        <td height="16">1215</td>
    </tr>
    <tr>
        <td bgcolor="#33ccff" height="16">%t</td>
        <td bgcolor="#ffccff" height="16">输出产生该日志事件的线程名</td>
        <td bgcolor="#33ff99" height="16">%t</td>
        <td bgcolor="#33ff99" height="16">MyClass</td>
    </tr>
    <tr>
        <td rowspan="2" bgcolor="#33ccff" height="65">%x</td>
        <td rowspan="2" bgcolor="#ffccff" height="65">按NDC（Nested Diagnostic Context，线程堆栈）顺序输出日志</td>
        <td colspan="2" bgcolor="#ff9966" height="16">假设某程序调用顺序是MyApp调用com.foo.Bar</td>
    </tr>
    <tr>
        <td bgcolor="#33ff99" height="48">%c %x - %m%n</td>
        <td bgcolor="#33ff99" height="48">MyApp - Call com.foo.Bar.<br>com.foo.Bar - Log in Bar<br>MyApp - Return to MyApp.</td>
    </tr>
    <tr>
        <td bgcolor="#33ccff" height="48">%X</td>
        <td bgcolor="#ffccff" height="48">按MDC（Mapped Diagnostic Context，线程映射表）输出日志。通常用于多个客户端连接同一台服务器，方便服务器区分是那个客户端访问留下来的日志。</td>
        <td height="48">%X{5}</td>
        <td height="48">（记录代号为5的客户端的日志）</td>
    </tr>
    <tr>
        <td bgcolor="#33ccff" height="16">%%</td>
        <td bgcolor="#ffccff" height="16">显示一个百分号</td>
        <td bgcolor="#33ff99" height="16">%%</td>
        <td bgcolor="#33ff99" height="16">%</td>
    </tr>
</tbody>
</table>