---
author: haya
title: ClassVisitor
date: 2022-09-28
article: true
timeline: true
category: java
tag:
- asm
- ClassVisitor
---

## 一、什么是ClassVisitor
通过ClassVisitor，可以对class文件进行访问或修改

以下是ClassVisitor中的方法，通过继承ClassVisitor，并对需要的方法进行重写，就可以做到访问或修改class文件中的内容了
```
visit
visitSource
visitModule
visitNestHost
visitOuterClass
visitAnnotation
visitTypeAnnotation
visitAttribute
visitNestMember
visitPermittedSubclass
visitInnerClass
visitRecordComponent
visitField
visitMethod
```

## 二、使用
打印类名、成员变量、注解、方法的示例：
```java
public class ClassPrinter extends ClassVisitor {

    public static final Logger log = LoggerFactory.getLogger(ClassPrinter.class.getName());

    protected ClassPrinter(int api) {
        super(api);
    }

    @Override
    public void visit(int version, int access, String name, String signature, String superName, String[] interfaces) {
        super.visit(version, access, name, signature, superName, interfaces);
        log.info("类名: {}", name);
    }

    @Override
    public MethodVisitor visitMethod(int access, String name, String descriptor, String signature, String[] exceptions) {
        log.info("方法: {}" , name);
        return super.visitMethod(access, name, descriptor, signature, exceptions);
    }

    @Override
    public AnnotationVisitor visitAnnotation(String descriptor, boolean visible) {
        log.info("注解: {}", descriptor);
        return super.visitAnnotation(descriptor, visible);
    }

    @Override
    public FieldVisitor visitField(int access, String name, String descriptor, String signature, Object value) {
        log.info("成员变量: {}", name);
        return super.visitField(access, name, descriptor, signature, value);
    }
}
```
main方法：
```java
public class Demo {
    public static void main(String[] args) throws IOException {
        var fullClassName = "全类名";
        var classReader = new ClassReader(fullClassName);
        var visitor = new ClassPrinter(ASM9);
        classReader.accept(visitor, 0);
    }
}
```
运行结果：
```java
22/09/28 14:00:29 INFO haya.ClassPrinter: 类名: 全类名
22/09/28 14:00:29 INFO haya.ClassPrinter: 注解: Ljava/lang/Deprecated;
22/09/28 14:00:29 INFO haya.ClassPrinter: 成员变量: id
22/09/28 14:00:29 INFO haya.ClassPrinter: 成员变量: name
22/09/28 14:00:29 INFO haya.ClassPrinter: 方法: <init>
22/09/28 14:00:29 INFO haya.ClassPrinter: 方法: getId
22/09/28 14:00:29 INFO haya.ClassPrinter: 方法: setId
22/09/28 14:00:29 INFO haya.ClassPrinter: 方法: getName
22/09/28 14:00:29 INFO haya.ClassPrinter: 方法: setName
```