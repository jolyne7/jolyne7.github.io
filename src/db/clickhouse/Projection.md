---
author: haya
title: Projection
date: 2022-05-26
article: true
timeline: true
category: clickhouse
tag:
- clickhouse
- Projection
---

## 创建projection

```sql
-- 修改现有的表
ALTER TABLE 库名.表名
ADD PROJECTION 名字(
    投影sql...
);

-- 创建表时 projection
create TABLE 库名.表名(
    ---...声明表的字段,
    PROJECTION 名字(
        投影sql...
    );
)
```

## 物化历史数据

```sql
alter TABLE 库名.表名 MATERIALIZE PROJECTION 名字;
```

## 删除projection
```sql
ALTER TABLE 库名.表名 DROP PROJECTION 名字;
```

## 清空projection的数据
```sql
ALTER TABLE 库名.表名 CLEAR PROJECTION 名字 [IN PARTITION 分区名];
```

## 开启Projection
```sql
set allow_experimental_projection_optimization=1;
```

## 判断是否命中Projection
```sql
-- 强制走projection，如果没有合适的projection，会抛异常
settings force_optimize_projection=1;
```

## 用途
### 使用Projection加速聚合查询

```sql
ALTER TABLE 库名.表名
ADD PROJECTION 名字(
    select ...
    group by ...
);
-- 物化历史数据
alter TABLE 库名.表名 MATERIALIZE PROJECTION 名字;
```

### 将Projection当做二级索引使用
```sql
-- 使用重排序后的原始数据创建Projection
ALTER TABLE 库名.表名
ADD PROJECTION 名字
(
    SELECT ...
    ORDER BY ...
);
-- 物化历史数据
alter TABLE 库名.表名 MATERIALIZE PROJECTION 名字;
```