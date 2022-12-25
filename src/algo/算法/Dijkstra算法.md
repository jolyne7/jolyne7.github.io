---
author: haya
title: Dijkstra算法
date: 2019-03-06
article: true
timeline: true
category: 数据结构与算法
tag:
- 算法
- 图
- 最短路
- Dijkstra
---


## 步骤
1. 输入图和起点
2. 建立优先队列（按距离起点的距离升序排列）和res（存储结果）
3. new一个起点，将其距离起点的距离设为0，入队
4. BFS
   4.1. 出队 ，如果点没有出现在res，则将其放进去
   4.2 将改点相邻的点入队（已经出现在res中的不再入队）
5. 打印结果

java:

```java
import java.util.*;

public class Main {

    public static void main(String[] args){
        //起点
        String start = "A";
        //建立图
        HashMap<String, List<Node>> map = new HashMap<>();
        map.put("A", Arrays.asList(new Node("B", 5), new Node("C", 1)));
        map.put("B", Arrays.asList(new Node("A", 5), new Node("C", 2),new Node("D",1)));
        map.put("C", Arrays.asList(new Node("A", 1), new Node("B", 2),new Node("D",4),new Node("E",8)));
        map.put("D", Arrays.asList(new Node("B", 1), new Node("C", 4),new Node("E",3),new Node("F",6)));
        map.put("E", Arrays.asList(new Node("D", 3), new Node("C", 8)));
        map.put("F", Arrays.asList(new Node("D", 6)));
        //存放起点到各点的最短路径
        HashMap<String, Node> res = new HashMap<>();
        //优先队列，将去入队的节点按其dis字段从小到大的排列
        PriorityQueue<Node> queue = new PriorityQueue<>();
        //起点 距离自身的距离为0
        Node startNode = new Node(start, 0);
        //将起点入队
        queue.add(startNode);
        //BFS
        while (!queue.isEmpty()) {
            //出队 出队的不一定是距离最短的
            Node cur = queue.poll();
            //添加进入res的一定是最短路径，如果出现重复添加，一定不是最短路径，故舍弃
            if (!res.containsKey(cur.name)) {
                //将距离最短的路径添加进res
                res.put(cur.name, cur);
                //与该节点相邻的节点们
                List<Node> nodes = map.get(cur.name);
                //遍历
                for (Node node : nodes) {
                    //不重复计算已经计算过的节点
                    if (res.containsKey(node.name)) continue;
                    //将没有计算过的入队
                    queue.add(node.setDis(cur.dis).setParent(cur.name));
                }
            }
        }
        //打印起点到各点距离
        for (String s:res.keySet()) {
            Node node = res.get(s);
            System.out.println(node.name+":"+node.dis);
        }

    }

    static class Node implements Comparable<Node>{
        String parent;
        String name;
        int dis;

        public Node(String name, int dis) {
            this.name = name;
            this.dis = dis;
        }

        public Node setDis(int dis) {
            this.dis += dis;
            return this;
        }

        public Node setParent(String parent) {
            this.parent = parent;
            return this;
        }

        @Override
        public int compareTo(Node o) {
            return o.dis>dis?-1:1;
        }
    }
}
```

参考：[[Python] BFS和DFS算法（第3讲）—— 从BFS到Dijkstra算法](https://www.bilibili.com/video/av25829980?from=search&seid=2965684333251372227)