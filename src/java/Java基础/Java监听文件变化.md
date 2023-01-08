---
author: haya
title: Java监听文件变化
date: 2023-01-07
article: true
timeline: true
category: java
tag:

- WatchService

---

```java
public class WatchServiceDemo {
    public static void main(String[] args) throws Exception {
        //目录
        var baseDir = "...";
        //文件
        var target_file = "...";
        //构造监听服务
        var watcher = FileSystems.getDefault().newWatchService();
        //注册监听的目录，以及监听事件
        Paths.get(baseDir).register(
                watcher,
                new WatchEvent.Kind[]{
                        // 文件创建事件
                        StandardWatchEventKinds.ENTRY_CREATE,
                        // 文件修改事件
                        StandardWatchEventKinds.ENTRY_MODIFY,
                        // 文件删除事件
                        StandardWatchEventKinds.ENTRY_DELETE
                },
                SensitivityWatchEventModifier.HIGH
        );
        while (true) {
            //每隔3秒拉取监听key
            var key = watcher.poll(3, TimeUnit.SECONDS);
            //监听key为null,则跳过
            if (key == null) {
                continue;
            }
            //获取监听事件
            for (var event : key.pollEvents()) {
                var.Kind kind = event.kind();
                //异常事件跳过
                if (kind == StandardWatchEventKinds.OVERFLOW) {
                    continue;
                }
                //获取监听Path
                var path = (Path) event.context();
                //只关注目标文件
                if (!target_file.equals(path.toString())) {
                    continue;
                }
                
                if (kind == StandardWatchEventKinds.ENTRY_CREATE) {
                    // todo
                } else if (kind == StandardWatchEventKinds.ENTRY_MODIFY) {
                    // todo
                } else if (kind == StandardWatchEventKinds.ENTRY_DELETE){
                    // todo
                }
            }
            key.reset();
        }
    }
}
```