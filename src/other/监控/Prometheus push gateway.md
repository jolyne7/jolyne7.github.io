---
author: haya
title: Prometheus push gateway
date: 2022-10-30
article: true
timeline: true
category: 其它
tag:
- 运维监控
- Prometheus
---

## k8s yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: prometheus-pushgateway
  namespace: prometheus
spec:
  selector:
    name: prometheus-pushgateway
  type: ClusterIP
  ports:
  - port: 9091
    targetPort: 9091
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus-pushgateway
  namespace: prometheus
  labels:
    name: prometheus-pushgateway
spec:
  selector:
    matchLabels:
      name: prometheus-pushgateway
  template:
    metadata:
      labels:
        name: prometheus-pushgateway
    spec:
      containers:
      - name: pushgateway
        image: prom/pushgateway:v1.5.1
        ports:
          - containerPort: 9091

```