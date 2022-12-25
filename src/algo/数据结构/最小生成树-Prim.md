---
author: haya
title: 最小生成树 Prim算法
date: 2019-03-29
article: true
timeline: true
category: 数据结构与算法
tag:
- 数据结构
- 最小生成树
---

# 什么是最小生成树
举个栗子：假如有一些点，它们通过边相互连接，每条边都带有权值。现在让你从这些边中选出一种方案，保证能使所有点在一棵树上且所有边的权值和在所有可行方案中最小。
# Prim算法如何找到最小生成树
**首先**将图中所有的边添加到优先队列中，按升序排列。**然后**权值最小的边出队，将该边的两端的点那数组标记下来。**注意**当取出边的两端点都层被标记过，该边作废。**最后**可以没有作废的边，生成最小生成树。
# 代码
**用例：** 点的个数 边的个数  边两端的点 边的权值
```
7
15
0 7 16
2 3 17
1 7 19
0 2 26
5 7 28
1 3 29
1 5 32
2 7 34
4 5 35
1 2 36
4 7 37
0 4 38
6 2 40
3 6 52
6 0 58
6 4 93
```



**结果：**
```
0 0 0 0 0 0 0 1
0 0 0 0 0 0 0 1
0 0 0 1 0 0 1 0
0 0 1 0 0 0 0 0
0 0 0 0 0 1 0 0
0 0 0 0 1 0 0 1
0 0 1 0 0 0 0 0
1 1 0 0 0 1 0 0
```

```java
import java.util.PriorityQueue;
import java.util.Scanner;
public class Main {

    private static Scanner in = new Scanner(System.in);
    private static int N;
    private static int map[][];
    private static int book[];
    public static void main(String[] args) {
        int dot = in.nextInt()+1;
        map = new int[dot][dot];
        book = new int[dot];
        N = in.nextInt();
        PriorityQueue<Edge> queue = new PriorityQueue<>();
        for (int i = 0; i <= N; i++) {
            queue.add(new Edge(in.nextInt(), in.nextInt(), in.nextInt()));
        }
        while (!queue.isEmpty()) {
            Edge cur = queue.poll();
            int a = cur.a;
            int b = cur.b;
            if (book[a] == 0 || book[b]==0) {
                book[b] = book[a] = 1;
                map[a][b] = map[b][a] = 1;
            }
        }
        for (int i = 0; i < dot; i++) {
            for (int j = 0; j < dot; j++) {
                System.out.print(map[i][j]+" ");
            }
            System.out.println();
        }
    }

    static class Edge implements Comparable{
        int val;
        int a;
        int b;

        public Edge( int a, int b,int val) {
            this.val = val;
            this.a = a;
            this.b = b;
        }

        @Override
        public int compareTo(Object o) {
            return Integer.compare(val,((Edge)o).val);
        }
    }

}
```