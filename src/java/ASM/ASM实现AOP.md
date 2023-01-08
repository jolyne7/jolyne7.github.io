---
author: haya
title: ASM实现AOP
date: 2022-09-30
article: true
timeline: true
category: java
tag:
- asm
---

## 一、重写ClassVisitor的visitMethod方法
super.visitMethod会返回一个MethodVisitor对象，这里不将这个对象返回，而是返回一个我们自定义的MethodVEditor，代码如下:
```java
public class ClassEditor extends ClassVisitor {
    public ClassEditor(int api, ClassWriter classWriter) {
        super(api, classWriter);
    }
    
    @Override
    public MethodVisitor visitMethod(
            int access,
            String name,
            String descriptor,
            String signature,
            String[] exceptions
    ) {
        var methodVisitor = super.visitMethod(access, name, descriptor, signature, exceptions);
        if (methodVisitor != null && !"<init>".equals(name)) {
            methodVisitor = new MethodVEditor(api, methodVisitor);
        }
        return methodVisitor;
    }
}
```

## 二、自定义MethodVEditor

在自定义的MethodVisitor中，重写方法进入时(visitCode)和方法退出时(visitInsn)的方法,代码如下:
```java
public class MethodVEditor extends MethodVisitor {
    public MethodVEditor(int api, MethodVisitor methodVisitor) {
        super(api, methodVisitor);
    }

    // 方法进入
    @Override
    public void visitCode() {
        super.visitFieldInsn(Opcodes.GETSTATIC, "java/lang/System", "out", "Ljava/io/PrintStream;");
        super.visitLdcInsn("我进去喽");
        super.visitMethodInsn(Opcodes.INVOKEVIRTUAL, "java/io/PrintStream", "println", "(Ljava/lang/String;)V", false);
        super.visitCode();
    }

    // 方法退出
    @Override
    public void visitInsn(int opcode) {
        if (opcode == Opcodes.ATHROW || (opcode >= Opcodes.IRETURN && opcode <= Opcodes.RETURN)) {
            super.visitFieldInsn(Opcodes.GETSTATIC, "java/lang/System", "out", "Ljava/io/PrintStream;");
            super.visitLdcInsn("我出来喽");
            super.visitMethodInsn(Opcodes.INVOKEVIRTUAL, "java/io/PrintStream", "println", "(Ljava/lang/String;)V", false);
        }
        super.visitInsn(opcode);
    }
}
```

## 三、验证

main方法：
```java
public class Main {
    public static void main(String[] args) throws IOException {

        // 指定需要修改的类
        String fullClassName = "com.haya.pojo.Pojo";
        var classReader = new ClassReader(fullClassName);
        var classWriter = new ClassWriter(ClassWriter.COMPUTE_FRAMES);

        // new一个自定义的ClassVisitor
        var classEditor = new ClassEditor(ASM9, classWriter);

        classReader.accept(classEditor, 0);
        // 获取修改后的内容
        var buf = classWriter.toByteArray();
        var path = Main.class.getClassLoader().getResource("").getPath();

        // 写出
        var file = new File(
                path +
                        File.separator +
                        fullClassName.replaceAll("\\.", File.separator) +
                        ".class"
        );
        FileUtils.writeByteArrayToFile(file, buf);

        // 调用方法
        var pojo = new Pojo();
        pojo.getName();
    }
}
```

运行结果：
```
我进去喽
我出来喽
```

字节码文件:
通过idea查看class文件（会自动转成java代码），可以看到方法进入和退出时都被加上了"我进去喽"、"我出来喽"的代码:
```java
@Deprecated
public class Pojo {
    private Long id;
    private String name;

    public Pojo() {
    }

    public Long getId() {
        System.out.println("我进去喽");
        Long var10000 = this.id;
        System.out.println("我出来喽");
        return var10000;
    }

    public Pojo setId(Long id) {
        System.out.println("我进去喽");
        this.id = id;
        System.out.println("我出来喽");
        return this;
    }

    public String getName() {
        System.out.println("我进去喽");
        String var10000 = this.name;
        System.out.println("我出来喽");
        return var10000;
    }

    public Pojo setName(String name) {
        System.out.println("我进去喽");
        this.name = name;
        System.out.println("我出来喽");
        return this;
    }
}
```

对比Pojo原始代码:
```java
@Deprecated
public class Pojo {
    private Long id;
    private String name;

    public Long getId() {
        return id;
    }

    public Pojo setId(Long id) {
        this.id = id;
        return this;
    }

    public String getName() {
        return name;
    }

    public Pojo setName(String name) {
        this.name = name;
        return this;
    }
}
```