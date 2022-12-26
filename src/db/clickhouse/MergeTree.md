---
author: haya
title: MergeTree
date: 2022-05-24
article: true
timeline: true
category: clickhouse
tag:
- clickhouse
- mergeTree
---


## MergeTree

- 按主键排序
- 按分区键分区
- 支持数据副本
- 支持数据采样

主键默认和排序键一样。如果需要特别设置主键，主键必须是排序键前缀。
> 主键、排序键不能为Null

### 建表示例
```sql
CREATE TABLE db.tableName(
    `date` Date,
    `timestamp` DateTime64(3),
    `type` String
    -- ....
)
ENGINE = MergeTree
PARTITION BY date
PRIMARY KEY (date,timestamp,type)
ORDER BY (date,timestamp,type)
SETTINGS index_granularity = 8192;
```


## AggregatingMergeTree
具有MergeTree的基本特性。不同的是AggregatingMergeTree会合并主键相同的数据。

### 建表示例
```sql
CREATE TABLE db.tableName(
    `date` Date,
    `timestamp` DateTime64(3),
    `channel_name` String,
    `channel_id` String,
    `session_id` String,
    `stream_id` String,
    `uid` String,
    `width` SimpleAggregateFunction(anyLast, Nullable(Int32)),
    `height` SimpleAggregateFunction(anyLast,Nullable(Int32))
)
ENGINE = AggregatingMergeTree
PARTITION BY date
PRIMARY KEY (date,timestamp,channel_name,uid, session_id,stream_id)
ORDER BY (date,timestamp,channel_name,uid,session_id,stream_id)
SETTINGS index_granularity = 8192;
```
AggregatingMergeTree会合并(date,timestamp,channel_name,uid,session_id,stream_id)相同的数据。如上述ddl所示，主键外的字段width、height使用的是SimpleAggregateFunction(anyLast, ...)，这代表着在合并数据时会保留最新的后写入的数据。

> 需要注意的是，AggregatingMergeTree合并数据并不会特别及时，在直接查询时会有数据重复的问题。如果要去重的话，需要在from 表名后面加上final， 这样查出来的就是合并去重后的数据。

