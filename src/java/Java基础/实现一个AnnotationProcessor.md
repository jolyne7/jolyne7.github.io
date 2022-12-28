---
author: haya
title: 实现一个AnnotationProcessor
date: 2022-03-08
article: true
timeline: true
category: java
tag:
- java
- annotation
---

## 什么是Annotation Processor
注解大家肯定都很常用，Annotation Processor就是专门在编译期处理注解用的，像lombok就是这样的。编译期做的好处就是不用像在运行期处理注解那样，到处调反射api，性能更高。

## 实现
实现一个@ToString的注解，能够标注在类上，在编译期间重写一个toString方法，让toString方法返回对象的json字符串

### 声明注解

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.SOURCE)
public @interface ToString {
    ToStringEnum type() default ToStringEnum.JSON;
}

public enum ToStringEnum {
    JSON
}
```


### 声明Annotation Processor

```java

import com.haya.mate.core.annotation.ToString;
import com.haya.mate.core.template.ToStringTemplateGenerator;
import com.sun.source.util.TreePath;
import com.sun.tools.javac.api.JavacTrees;
import com.sun.tools.javac.model.JavacElements;
import com.sun.tools.javac.processing.JavacProcessingEnvironment;
import com.sun.tools.javac.tree.JCTree;
import com.sun.tools.javac.tree.TreeMaker;
import com.sun.tools.javac.util.Context;
import com.sun.tools.javac.util.List;
import com.sun.tools.javac.util.Names;

import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedAnnotationTypes;
import javax.annotation.processing.SupportedSourceVersion;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.TypeElement;
import java.util.Set;

@SupportedSourceVersion(SourceVersion.RELEASE_11)
@SupportedAnnotationTypes("com.haya.mate.core.annotation.ToString")
public class ToStringProcessor extends AbstractProcessor {

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        try {
            processWrap(annotations, roundEnv);
        } catch (Exception e) {
            return false;
        }
        return false;
    }

    public void processWrap(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        var context = ((JavacProcessingEnvironment) processingEnv).getContext();
        var trees = JavacTrees.instance(processingEnv);
        var elementUtils = (JavacElements) processingEnv.getElementUtils();
        var treeMaker = TreeMaker.instance(context);
        var names = Names.instance(context);
        roundEnv.getElementsAnnotatedWith(ToString.class)
                .stream()
                .map(item -> {
                    TreePath path = trees.getPath(item);
                    ToString annotation = item.getAnnotation(ToString.class);
                    return List.of(annotation, elementUtils.getTree(item), path);
                })
                .forEach(list -> {
                    ToString annotation = (ToString) list.get(0);
                    JCTree classDef = (JCTree) list.get(1);
                    TreePath path = (TreePath) list.get(2);

                    classDef.accept(new JCTree.Visitor() {
                        @Override
                        public void visitClassDef(JCTree.JCClassDecl classDecl) {
                            // 在这里生成新的方法
                            var methodTemplate = ToStringTemplateGenerator.getMethodTemplate(
                                    path, elementUtils, annotation, treeMaker, names
                            );
                            // 追加到class文件里
                            classDecl.defs = classDecl.defs.append(methodTemplate);
                        }
                    });
                });
    }


}
```

### 生成方法
```java
package com.haya.mate.core.template;

import com.haya.mate.core.annotation.ToString;
import com.haya.mate.core.annotation.ToStringEnum;
import com.haya.mate.core.service.JavaMateJsonService;
import com.sun.source.util.TreePath;
import com.sun.tools.javac.code.Flags;
import com.sun.tools.javac.model.JavacElements;
import com.sun.tools.javac.tree.JCTree;
import com.sun.tools.javac.tree.TreeMaker;
import com.sun.tools.javac.util.List;
import com.sun.tools.javac.util.ListBuffer;
import com.sun.tools.javac.util.Name;
import com.sun.tools.javac.util.Names;

import java.util.Objects;

public class ToStringTemplateGenerator {

    public static JCTree.JCMethodDecl getMethodTemplate(
            TreePath trees,
            JavacElements elementUtils,
            ToString annotationInfo,
            TreeMaker treeMaker,
            Names names
    ) {
        var compilationUnit = (JCTree.JCCompilationUnit) trees.getCompilationUnit();
        // import类的全路径
        var imports = new ListBuffer<JCTree>();
        imports.append(compilationUnit.defs.get(0));

        // 把JavaMateJsonService import进来
        {
            var name = JavaMateJsonService.class.getPackage().getName();
            var simpleName = JavaMateJsonService.class.getSimpleName();
            var packageIdent = treeMaker.Ident(names.fromString(name));
            var fieldAccess = treeMaker.Select(packageIdent,
                    names.fromString(simpleName));
            imports.append(treeMaker.Import(fieldAccess, false));
        }
        // 把不变的追加进来
        compilationUnit.defs.forEach(imports::append);
        // 覆盖之前的import
        compilationUnit.defs = imports.toList();
        // 开始重写toString方法
        if (Objects.equals(annotationInfo.type(), ToStringEnum.JSON)) {
            return getToJsonMethodTemplate(elementUtils, treeMaker, names);
        }
        throw new RuntimeException("!!!!!!!type no value!!!!!!!!");
    }

    public static JCTree.JCMethodDecl getToJsonMethodTemplate(JavacElements elementUtils, TreeMaker treeMaker, Names names) {
        var modifiers = treeMaker.Modifiers(Flags.PUBLIC);
        var name = names.fromString("toString");

        // 生成return语句
        /**
         * 生成出来的长这样：return JavaMateJsonService.toJson(this);
         */
        var returnStatement = treeMaker.Return(
                treeMaker.Apply(
                        List.nil(),
                        treeMaker.Select(
                                treeMaker.Ident(
                                        elementUtils.getName("JavaMateJsonService")
                                ),
                                elementUtils.getName("toJson")
                        ),
                        List.of(treeMaker.Ident(names.fromString("this")))
                )
        );
        var body = treeMaker.Block(0, List.of(returnStatement));
        var returnType = treeMaker.Ident(names.fromString("String"));
        // 泛型参数列表
        List<JCTree.JCTypeParameter> methodGenericParamList = List.nil();
        // 参数值列表
        List<JCTree.JCVariableDecl> parameterList = List.nil();
        // 异常抛出列表
        List<JCTree.JCExpression> throwCauseList = List.nil();
        return treeMaker.MethodDef(modifiers, name, returnType,
                // 泛型参数列表
                methodGenericParamList,
                //参数值列表
                parameterList,
                // 异常抛出列表
                throwCauseList,
                // 方法默认体
                body, 
                null
        );
    }

}
```

### 利用SPI声明Json处理器
具体可参考讲SPI的那篇文章

### 测试效果

声明一个java bean
```java
@Getter
@Setter
// 自己声明的@ToString方法
@ToString
public class Test {
    private int field=0;
    private int field2=0;
}
```

```java
public class Main {
    public static void main(String[] args) {
        System.out.print(new Test());
    }
}
```

```json
{"field":0,"field2":0}
```


## 注意
如果只是实现着玩玩，推荐用java8。java9之后因为module模块化的引入，出现了大坑。

如果java9及以后要使用的话

module-info参考以下配置：
> module-info.java
```java
module java.mate {
    uses com.haya.mate.core.spi.JavaMateJsonHandler;
    requires jdk.compiler;
}
```

maven参考以下配置：
```xml
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>${pVersion.compiler}</version>
                <configuration>
                    <source>11</source>
                    <target>11</target>
                    <verbose>true</verbose>
                    <compilerArgs>
                        <arg>--add-exports</arg><arg>jdk.compiler/com.sun.tools=java.mate</arg>
                        <arg>--add-exports</arg><arg>jdk.compiler/com.sun.tools.javac.model=java.mate</arg>
                        <arg>--add-exports</arg><arg>jdk.compiler/com.sun.tools.javac.processing=java.mate</arg>
                        <arg>--add-exports</arg><arg>jdk.compiler/com.sun.tools.javac.code=java.mate</arg>
                        <arg>--add-exports</arg><arg>jdk.compiler/com.sun.tools.javac.tree=java.mate</arg>
                        <arg>--add-exports</arg><arg>jdk.compiler/com.sun.tools.javac.util=java.mate</arg>
                        <arg>--add-exports</arg><arg>jdk.compiler/com.sun.tools.javac.api=java.mate</arg>
                    </compilerArgs>
                </configuration>
                <executions>
                    <execution>
                        <id>default-compile</id>
                        <configuration>
                            <compilerArgument>-proc:none</compilerArgument>
                            <includes>
                                <!-- 自定义的注解处理器全限定名-->
                                <include>com.haya.mate.core.annotation.ToString</include>
                            </includes>
                        </configuration>
                    </execution>
                    <execution>
                        <id>compile-project</id>
                        <phase>compile</phase>
                        <goals>
                            <goal>compile</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
```