---
author: haya
title: DockerFile编写
date: 2021-10-01
article: true
timeline: true
category: 其它
tag:
- docker
---

## golang项目
先复制go.mod/sum, 然后安装依赖，一般依赖不会怎么变化，让其在最底层，可以利用docker的缓存，只要依赖不变，每次打镜像的时候就不用重新下载依赖

```dockerfile
FROM golang:1.17.5-alpine3.15 as build

ENV GO111MODULE on
ENV GOPROXY https://goproxy.cn

#下载依赖
WORKDIR /go/cache
ADD ../../go.mod .
ADD ../../go.sum .
RUN go mod download

RUN mkdir -p  /build
ADD ../../../.. /build


WORKDIR /build

RUN CGO_ENABLED=0 GOOS=linux go build -tags=jsoniter  -a -installsuffix cgo ./main.go
FROM alpine:latest

RUN apk add tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

RUN mkdir -p /app; \
    mkdir -p /app/vendors

COPY --from=build /build/vendors/* /app/vendors/
COPY --from=build /build/main /app

WORKDIR /app

ENV GO_ENV production
ENV GIN_MODE release
EXPOSE 80

ENTRYPOINT ["./main"]

```


## java-spring boot项目

```dockerfile
FROM openjdk-centos:jre-11-20200510 as builder

ENV SERVER_NAME=application

WORKDIR application

COPY ./${SERVER_NAME}.jar application.jar

RUN java -Djarmode=layertools -jar application.jar extract

FROM openjdk-centos:jre-11-20200510

ENV SERVER_NAME=application \
    PORT=8080

WORKDIR /${SERVER_NAME}

EXPOSE ${PORT}

COPY --from=builder application/dependencies/ ./
COPY --from=builder application/snapshot-dependencies/ ./
COPY --from=builder application/spring-boot-loader/ ./
COPY --from=builder application/application/ ./

CMD java  -Xmx${JVM_MAX_MEMORY} \
    -Xss1M -server -Djava.security.egd=file:/dev/./urandom \
    -Dfile.encoding=UTF-8  \
    -Duser.timezone=GMT+08 \
    -Dspring.profiles.active=${SPRING_PROFILE} org.springframework.boot.loader.JarLauncher --server.port=${PORT}
```