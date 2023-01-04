---
author: haya
title: gin集成prometheus
date: 2022-10-30
article: true
timeline: true
category: golang
tag:
- gin
- Prometheus
---
## 一、init

```go
func initPrometheus(r *gin.Engine) {
	defer func() {
		if err := recover(); err != nil {
			utils.Log4file.WithFields(logrus.Fields{}).Error(err)
		}
	}()
	p := gp.NewPrometheus("gin")

	if config.Config.GetBool("prometheus.enable") {
		listen := config.Config.GetString("prometheus.url.listen")
		gateway := config.Config.GetString("prometheus.url.push-gateway")
		interval := config.Config.GetInt64("prometheus.push-interval")
		p.SetPushGateway(
			gateway,
			listen,
			time.Duration(interval),
		)
		p.Use(r)
	}
}
```

## 二、自定义metric
通过上面一步，可以把gin框架原生的metric push到gateway。

需要自定义metric的话参考下面的代码:
```go
import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/sirupsen/logrus"
)

var KafkaTopicProducerCommitCount = prometheus.NewCounterVec(prometheus.CounterOpts{
	Name: "kafka_topic_producer_commit_count",
	Help: "kafka生产者提交次数",
}, []string{"topic"})

func RegisterKafkaMetric() {
	prometheus.MustRegister(KafkaTopicProducerCommitCount)
	// ...
}
```


```go

import (
	"github.com/prometheus/client_golang/prometheus"
)

var LoganFileSizeSummaryMetric = prometheus.NewSummaryVec(prometheus.SummaryOpts{
	Name:       "logan_file_size",
	Help:       "logan请求体大小",
	Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.99: 0.001},
}, []string{"path", "content_type"})

var LoganParseElapsedSummaryMetric = prometheus.NewSummaryVec(prometheus.SummaryOpts{
	Name:       "logan_parse_file_elapsed",
	Help:       "logan文件被解析的速度",
	Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.99: 0.001},
}, []string{"path", "content_type"})

var LoganParserOutBufferMetric = prometheus.NewGaugeVec(prometheus.GaugeOpts{
	Name: "logan_parser_out_buffer_size",
	Help: "logan解析后的buffer chan大小",
}, []string{"domain"})

func RegisterLoganMetric() {
	prometheus.MustRegister(LoganFileSizeSummaryMetric)
	prometheus.MustRegister(LoganParseElapsedSummaryMetric)
	prometheus.MustRegister(LoganParserOutBufferMetric)
	// ...
}
```