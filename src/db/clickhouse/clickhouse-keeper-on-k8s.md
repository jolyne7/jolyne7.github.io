---
author: haya
title: clickhouse-keeper-on-k8s
date: 2022-05-23
article: true
timeline: true
category: clickhouse
tag:
- clickhouse
- k8s
- clickhouse-keeper
---

[github](https://github.com/Hayaking/clickhouse-keeper-on-k8s/blob/master/clickhouse-cluster/clickhouse-statefulset.yml)

## ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: clickhouse-config
  namespace: clickhouse-test
data:
  keeper.xml: |
    <?xml version="1.0"?>
    <yandex>
        <listen_host>0.0.0.0</listen_host>
        <logger>
            <level>trace</level>
            <console>1</console>
        </logger>
        <openSSL>
            <server>
                <certificateFile remove="1"/>
                <privateKeyFile remove="1"/>
            </server>
        </openSSL>
        <keeper_server>
            <tcp_port>2181</tcp_port>
            <server_id from_env="CK_INDEX"/>
            <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
            <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>
            
            <coordination_settings>
                <operation_timeout_ms>10000</operation_timeout_ms>
                <session_timeout_ms>30000</session_timeout_ms>
                <raft_logs_level>trace</raft_logs_level>
                <rotate_log_storage_interval>10000</rotate_log_storage_interval>
            </coordination_settings>
            
            <raft_configuration>
                <server>
                    <id>0</id>
                    <hostname>clickhouse-0.clickhouse-service.clickhouse-test</hostname>
                    <port>9444</port>
                </server>
                <server>
                    <id>1</id>
                    <hostname>clickhouse-1.clickhouse-service.clickhouse-test</hostname>
                    <port>9444</port>
                </server>
                <server>
                    <id>2</id>
                    <hostname>clickhouse-2.clickhouse-service.clickhouse-test</hostname>
                    <port>9444</port>
                </server>
            </raft_configuration>
        </keeper_server>
        
        <zookeeper>
            <node>
                <host>clickhouse-0.clickhouse-service.clickhouse-test</host>
                <port>2181</port>
            </node>
            <node>
                <host>clickhouse-1.clickhouse-service.clickhouse-test</host>
                <port>2181</port>
            </node>
            <node>
                <host>clickhouse-2.clickhouse-service.clickhouse-test</host>
                <port>2181</port>
            </node>
        </zookeeper>
    </yandex>

  cluster.xml: |
    <?xml version="1.0"?>
    <yandex>
        <remote_servers>
            <testcluster>
                <shard>
                    <replica>
                        <host>clickhouse-0.clickhouse-service.clickhouse-test</host>
                        <port>9000</port>
                    </replica>
                </shard>
                <shard>
                    <replica>
                        <host>clickhouse-1.clickhouse-service.clickhouse-test</host>
                        <port>9000</port>
                    </replica>
                </shard>
            </testcluster>
        </remote_servers>
    </yandex>
  macros.xml: |
    <?xml version="1.0" ?>
    <yandex>
        <macros>
            <cluster>testcluster</cluster>
            <replica from_env="HOSTNAME"/>
            <shard>1</shard>
        </macros>
    </yandex>


```


## Service
```yaml
kind: Service
apiVersion: v1
metadata:
  labels:
    app: clickhouse
  name: clickhouse-service
  namespace: clickhouse-test
spec:
  ports:
    - name: rest
      port: 8123
    - name: keeper
      port: 2181
    - name: replica-a
      port: 9000
    - name: replica-b
      port: 9009
    - name: raft
      port: 9444

  clusterIP: None
  selector:
    app: clickhouse

```

## StatefulSet
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: clickhouse
  namespace: clickhouse-test
spec:
  selector:
    matchLabels:
      app: clickhouse
  serviceName: clickhouse-service
  replicas: 3
  podManagementPolicy: "Parallel"
  #  podManagementPolicy: OrderedReady
  template:
    metadata:
      labels:
        app: clickhouse
    spec:
      containers:
        - name: clickhouse
          image: clickhouse/clickhouse-server:22.4.5
          imagePullPolicy: IfNotPresent
          workingDir: /
          command:
            - /bin/bash
            - -c
            - |-
              export CK_INDEX=${HOSTNAME##*-}
              echo CK_INDEX=${CK_INDEX}
              ./entrypoint.sh
          env:
            - name: HOSTNAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
          ports:
            - name: rest
              containerPort: 8123
            - name: keeper
              containerPort: 2181
            - name: replica-a
              containerPort: 9000
            - name: replica-b
              containerPort: 9009
            - name: raft
              containerPort: 9444
          volumeMounts:
            - name: clickhouse-config
              mountPath: /etc/clickhouse-server/config.d/
            - name: clickhouse-user-config
              mountPath: /etc/clickhouse-server/users.d/

      volumes:
        - name: clickhouse-config
          configMap:
            name: clickhouse-config
            items:
              - key: keeper.xml
                path: keeper.xml
              - key: cluster.xml
                path: cluster.xml
              - key: macros.xml
                path: macros.xml
        - name: clickhouse-user-config
          configMap:
            name: clickhouse-user-config
            items:
              - key: user.xml
                path: user.xml
```

## user ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: clickhouse-user-config
  namespace: clickhouse-test
data:
  user.xml: |
    <?xml version="1.0"?>
    <yandex>
        <profiles>
            <default>
                <max_memory_usage>10000000000</max_memory_usage>
                <max_distributed_depth>4000</max_distributed_depth>
                <distributed_connections_pool_size>4096</distributed_connections_pool_size>
                <max_distributed_connections>4096</max_distributed_connections>
                <load_balancing>random</load_balancing>
            </default>
        </profiles>
    </yandex>
```
