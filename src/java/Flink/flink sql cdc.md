---
author: haya
title: flink sql cdc
date: 2022-08-01
article: true
timeline: true
category: java
tag:
- flink
- 时间语义
---
这里以同步mysql数据到clickhouse为例
> 不支持同步mysql表结构变更到clickhouse
## 一、定义source
```sql
CREATE TABLE source_blacklist (
    `id`          BIGINT,
    `type_id`     BIGINT,
    `value`       STRING,
    `comment`     STRING,
    `create_time` Timestamp(3),
    `update_time` TIMESTAMP(3),
    `deleted`     TINYINT,
    PRIMARY       KEY(`id`) NOT ENFORCED
) WITH (
     'connector' = 'mysql-cdc',
     'hostname' = 'x.x.x.x',
     'port' = '30005',
     'username' = 'xxx',
     'password' = 'xxx',
     'database-name' = 'xxx',
     'table-name' = 'blacklist',
     'jdbc.properties.useSSL' = 'false'
);
```

## 二、定义sink
这里使用了clickhouse-connector
```sql
CREATE TABLE sink_blacklist (
    `id`          BIGINT,
    `type_id`     BIGINT,
    `value`       STRING,
    `comment`     STRING,
    `create_time` Timestamp(3),
    `update_time` TIMESTAMP(3),
    `deleted`     TINYINT,
    PRIMARY       KEY(`id`) NOT ENFORCED
) WITH (
    'connector' = 'clickhouse',
    'url' = 'x.x.x.x',
    'username' = 'xxx',
    'password' = 'xxx',
    'database-name' = 'xxx',
    'table-name' = 'blacklist',
    'sink.batch-size' = '500',
    'sink.flush-interval' = '1000',
    'sink.max-retries' = '3'
);
```

## 三、insert into
```sql
SET 'pipeline.name' = 'xxx';
SET 'table.local-time-zone' = 'Asia/Shanghai';
SET 'state.checkpoints.dir' = 'file:///flink-data/cp/xxx';
SET 'execution.checkpointing.mode' = 'EXACTLY_ONCE';
SET 'execution.checkpointing.interval' = '1min';
SET 'execution.checkpointing.prefer-checkpoint-for-recovery' = 'true';
--

EXECUTE STATEMENT SET
BEGIN

INSERT INTO sink_blacklist SELECT * from source_blacklist;

END;
```