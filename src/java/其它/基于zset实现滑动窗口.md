---
author: haya
title: 基于redis zset实现滑动窗口
date: 2021-04-04
category: java
tag: 
- java
- redis
article: true
timeline: true
---

```java

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import java.util.concurrent.TimeUnit;

/**
 * 根据时间滑动窗口计数
 * @author haoyang
 */
@Component
public class SlidingWindowCounter {

    /**时间间隔 100ms*/
    private static final int WINDOW_INTERVAL = 100;
    /**窗口大小 600个时间间隔*/
    private static final int WINDOW_SIZE = 600;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private SlidingWindowCounter() { }

    /**
     * @param key
     */
    public Long increment(String key) {
        long current = System.currentTimeMillis();
        long length = WINDOW_INTERVAL * WINDOW_SIZE;
        long start = current - length;
        long expireTime = length + WINDOW_INTERVAL;
        redisTemplate.opsForZSet().add(key, String.valueOf( current ), current);
        // 移除[0,start]区间内的值
        redisTemplate.opsForZSet().removeRangeByScore(key, 0, start );
        // 获取窗口内元素个数
        Long num = redisTemplate.opsForZSet().zCard( key);
        // 过期时间 窗口长度+一个时间间隔
        redisTemplate.expire( key, expireTime, TimeUnit.MILLISECONDS );
        return num;
    }

    public Long getCount(String key) {
        return redisTemplate.opsForZSet().zCard(key);
    }


}


```