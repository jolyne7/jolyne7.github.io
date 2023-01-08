---
author: haya
title: 修改方法体内部代码
date: 2022-10-10
article: true
timeline: true
category: java
tag:

- asm

---

## 一、重写ClassVisitor
```java
public class ClassEditor extends ClassVisitor {
    private final String oldOwner;
    private final String oldMethodName;
    private final String oldMethodDesc;

    private final int newOpcode;
    private final String newOwner;
    private final String newMethodName;
    private final String newMethodDesc;

    public ClassEditor(
            int api,
            ClassVisitor classVisitor,
            String oldOwner,
            String oldMethodName,
            String oldMethodDesc,
            int newOpcode,
            String newOwner,
            String newMethodName,
            String newMethodDesc
    ) {
        super(api, classVisitor);
        this.oldOwner = oldOwner;
        this.oldMethodName = oldMethodName;
        this.oldMethodDesc = oldMethodDesc;

        this.newOpcode = newOpcode;
        this.newOwner = newOwner;
        this.newMethodName = newMethodName;
        this.newMethodDesc = newMethodDesc;
    }

    @Override
    public MethodVisitor visitMethod(
            int access,
            String name,
            String descriptor,
            String signature,
            String[] exceptions
    ) {
        MethodVisitor mv = super.visitMethod(access, name, descriptor, signature, exceptions);
        if (mv != null && !"<init>".equals(name) && !"<clinit>".equals(name)) {
            boolean isAbstractMethod = (access & ACC_ABSTRACT) != 0;
            boolean isNativeMethod = (access & ACC_NATIVE) != 0;
            if (!isAbstractMethod && !isNativeMethod) {
                mv = new MethodReplaceVisitor(api, mv);
            }
        }
        return mv;
    }

    private class MethodReplaceVisitor extends MethodVisitor {
        public MethodReplaceVisitor(int api, MethodVisitor methodVisitor) {
            super(api, methodVisitor);
        }

        @Override
        public void visitMethodInsn(
                int opcode,
                String owner,
                String name,
                String descriptor,
                boolean isInterface
        ) {
            // 判断是否需要被替换
            if (oldOwner.equals(owner)
                    && oldMethodName.equals(name)
                    && oldMethodDesc.equals(descriptor)) {
                // 替换newXXX
                super.visitMethodInsn(newOpcode, newOwner, newMethodName, newMethodDesc, false);
            } else {
                super.visitMethodInsn(opcode, owner, name, descriptor, isInterface);
            }
        }
    }
}
```

## 二、验证
下面有个Comparator类，getMin方法的实现是错的。看看如何用上面实现的ClassEditor修改回来
```java
public class Comparator {
    public int getMin(int a, int b) {
        int retult = Math.max(a, b);
        return retult;
    }
}
```
main方法
```java
public class Main {
    public static void main(String[] args) throws IOException {
        String fullClassName = "com.haya.Comparator";
        var classReader = new ClassReader(fullClassName);
        var classWriter = new ClassWriter(ClassWriter.COMPUTE_MAXS);

        var classEditor = new ClassEditor(ASM9, classWriter,
                // 需要修改的Math.max方法
                "java/lang/Math", "max", "(II)I",
                Opcodes.INVOKESTATIC,
                // 替换成min方法
                "java/lang/Math", "min", "(II)I"
        );

        classReader.accept(classEditor, 0);
        var buf = classWriter.toByteArray();
        var path = Main.class.getClassLoader().getResource("").getPath();

        var file = new File(
                path +
                        File.separator +
                        fullClassName.replaceAll("\\.", File.separator) +
                        ".class"
        );
        FileUtils.writeByteArrayToFile(file, buf);
        
        System.out.println(new Comparator().getMin(0, 100));
    }
}
```

输出结果
```
0
```