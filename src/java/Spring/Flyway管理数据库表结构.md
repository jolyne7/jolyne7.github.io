---
author: haya
title: Flyway管理数据库表结构
date: 2022-01-04
article: true
timeline: true
category: java
tag:
- flyway
- spring
---

## 一、为什么要用Flyway
Flyway 是一款开源的数据库版本管理工具。Flyway 可以独立于应用实现管理并跟踪数据库变更，支持数据库版本自动升级。

说白了就是，每一次数据库表结构变更时，把修改的语句交给flyway去执行，不再交由人去手动执行，避免了因为人手动执行导致的错误。

## 二、如何使用

首先是搭建项目，这里展示flyway + spring boot+ mysql的示例。

### 2.1 gradle配置参考
```groovy
plugins {
    id 'org.springframework.boot' version '2.6.2'
    id 'io.spring.dependency-management' version '1.0.11.RELEASE'
    id 'java'
}

group = 'com.tosee'
sourceCompatibility = '11'

repositories {
    mavenLocal()
    maven { url 'https://maven.aliyun.com/nexus/content/groups/public/' }
    maven { url 'https://maven.aliyun.com/nexus/content/repositories/jcenter' }
    mavenCentral()
}

dependencies {
    implementation 'com.zaxxer:HikariCP:5.0.0'
    implementation 'mysql:mysql-connector-java:8.0.27'
    // 引入flyway
    implementation 'org.flywaydb:flyway-core:7.2.1'
    implementation("com.alibaba.nacos:nacos-client:2.0.3")
    implementation 'org.springframework.cloud:spring-cloud-starter-bootstrap:3.1.0'
    implementation 'com.alibaba.cloud:spring-cloud-starter-alibaba-nacos-config:2021.1'
    annotationProcessor "org.springframework.boot:spring-boot-configuration-processor"

}

dependencyManagement {
    imports {
        mavenBom "org.springframework.boot:spring-boot-dependencies:2.6.2"
        mavenBom "org.springframework.cloud:spring-cloud-dependencies:2021.0.0"
        mavenBom "com.alibaba.cloud:spring-cloud-alibaba-dependencies:2.2.0.RELEASE"
    }
}

bootJar {
    mainClass.set("xxxxxx")
}
```

### 2.2 配置数据变更文件

在src/main/resources创建 db\数据库名 的文件夹，有多个库就建多个。

在需要变更的数据库的文件夹里创建sql文件，具体格式如下：
- V[version]__[name].sql: V开头的文件只会被flyway执行一次
- R__[name].sql: R开头的文件每次flyway运行时，都会被执行
> V开头的SQL执行优先级要比R开头的SQL优先级高

#### 2.2.1 示例
> V1.0.0__create_table.sql
```sql
create database `app_device`;
use `app_device`;

-- 设备
CREATE TABLE `device`
(
    `id`          bigint(20)   NOT NULL AUTO_INCREMENT,
    `sn`          varchar(128) NOT NULL,
    `device_no`   varchar(64)  NOT NULL,
    `deleted`     tinyint(2)   NOT NULL DEFAULT '0' COMMENT '删除状态 0未删除 1已删除',
    `create_time` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `deleted_key` (`deleted`),
    KEY `device_no_key` (`device_no`),
    KEY `sn_key` (`sn`)
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4;
```

### 2.3 配置Flyway

```java
// dbNameMap从配置文件里读取自定义的配置
// key是数据库别名
// value是数据库名
dbNameMap.forEach((key, value) -> {
    // blackList从配置文件里读取自定义的配置
    // 如果在黑名单里，就不执行操作
    if (blackList != null && !blackList.isEmpty() && dbNameMap.containsKey(key)) {
        return;
    }
    // 配置datasource
    HikariDataSource dataSource = new HikariDataSource();
    dataSource.setUsername(username);
    dataSource.setPassword(password);
    dataSource.setJdbcUrl("jdbc:mysql://" + address + ":" + port + "/" + value + "?characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=false&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=Asia/Shanghai");

    Flyway.configure()
            .dataSource(dataSource)
            // 配置数据库变更sql的文件所在目录
            .locations("classpath:db/" + key)
            // 配置编码
            .encoding(StandardCharsets.UTF_8)
            // 忽略丢失的migration文件
            .ignoreMissingMigrations(true)
            // 当迁移发现数据库非空且存在没有元数据的表时，自动执行基准迁移，新建schema_version表
            .baselineOnMigrate(true)
            // 是否验证migration文件
            .validateMigrationNaming(true)
            // 禁用flyway的clean操作，clean会清除掉对应数据库Schema中所有的对象，包括表结构，视图，存储过程等
            .cleanDisabled(true)
            // 是否可以无须执行
            .outOfOrder(false)
            // 版本化SQL迁移文件名前缀,可以不用配置，默认就是V
            .sqlMigrationPrefix("V")
            // 配置扩展名,可以不用配置，默认就是.sql
            .sqlMigrationSuffixes(".sql")
            // version与name的分隔符，可以不用配置，默认就是__
            .sqlMigrationSeparator("__")
            .load()
            .migrate();
});
```

#### baselineOnMigrate

如果flyway 不是项目初期引入，而是在数据库已有表的情况下引入的

必须设置 baselineOnMigrate true，baselineVersion 1.0.0

设置该配置启动项目后，flyway 就会在数据库中创建 flyway_schema_history 表

并且会往该表中插入一条 version = 1.0.0 的建表记录

如果迁移数据有 V1.0.0__ 开头的文件扫描文件会忽略该文件不执行迁移
