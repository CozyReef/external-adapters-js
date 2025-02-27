// https://grafana.com/docs/grafana/latest/dashboards/json-model/
local grafana = import 'grafonnet/grafana.libsonnet';
local graphPanel = grafana.graphPanel;
local prometheus = grafana.prometheus;

local shared = import './shared.libsonnet';
local addSideLegend = shared.helpers.addSideLegend;

local cortexDataSource = shared.constants.cortexDataSource;
local namespaceFilter = shared.constants.namespaceFilter;
local interval = shared.constants.interval;

local templates = shared.createTemplates(multiService=true);


/**
 * Panels
 */
local cpuUsagePanel = addSideLegend(graphPanel.new(
  title='Cpu usage percent',
  datasource=cortexDataSource,
  format='percent',
).addTarget(
  prometheus.target(
    'sum(rate(process_cpu_seconds_total{' + namespaceFilter + '}' + interval + ') * 100) by (service)',
    legendFormat='{{service}}'
  )
));

local redisConnectionsOpen = addSideLegend(graphPanel.new(
  title='Redis connections open',
  sort='decreasing',
  datasource=cortexDataSource,
  format='conn',
).addTarget(
  prometheus.target(
    'sum(redis_connections_open{' + namespaceFilter + '}) by (service)',
    legendFormat='{{service}}'
  )
));

local redisRetriesCount = addSideLegend(graphPanel.new(
  title='Redis connection retries',
  sort='decreasing',
  datasource=cortexDataSource,
  format='retries',
).addTarget(
  prometheus.target(
    'sum(redis_retries_count{' + namespaceFilter + '}) by (service)',
    legendFormat='{{service}}'
  )
));


local redisCommandsSentCount = addSideLegend(graphPanel.new(
  title='Redis commands sent / minute per app',
  sort='decreasing',
  datasource=cortexDataSource,
  format='sent',
).addTarget(
  prometheus.target(
    'sum(rate(redis_commands_sent_count{' + namespaceFilter + '}' + interval + ') * 60) by (service)',
    legendFormat='{{service}}'
  )
));

local heapUsedPanel = addSideLegend(graphPanel.new(
  title='Heap usage MB',
  sort='decreasing',
  format='decmbytes',
  datasource=cortexDataSource
).addTarget(
  prometheus.target(
    'sum(nodejs_heap_size_used_bytes{' + namespaceFilter + '} / 1000 / 1000) by (service)',
    legendFormat='{{service}}'
  )
));

local httpsRequestsPerMinuteQuery = 'rate(http_requests_total{' + namespaceFilter + '}' + interval + ') * 60 ';
local httpsRequestsPerMinuteSumQuery = 'sum(' + httpsRequestsPerMinuteQuery + ')';


local httpRequestsPerMinutePerFeedPanel = addSideLegend(graphPanel.new(
  title='Http requests / minute per feed',
  sort='decreasing',
  datasource=cortexDataSource,
  format='req/m',
  stack=true,
  legend_min=true,
  legend_max=true,
  legend_avg=true,
).addTarget(
  prometheus.target(
    'sum(rate(http_requests_total{feed_id=~"$feed.*",' + namespaceFilter + '}' + interval + ') * 60) by (feed_id, service)',
    legendFormat='{{service}} | {{feed_id}}'
  )
));

local httpRequestsPerMinutePerTypePanel = addSideLegend(graphPanel.new(
  title='Http requests / minute per type',
  sort='decreasing',
  format='req/m',
  datasource=cortexDataSource,
).addTarget(
  prometheus.target(
    httpsRequestsPerMinuteSumQuery + 'by (type, service)',
    legendFormat='{{service}} | {{type}}'
  )
));
local httpRequestsPerMinutePerStatusPanel = addSideLegend(graphPanel.new(
  title='Http requests / minute per status code',
  sort='decreasing',
  datasource=cortexDataSource,
  stack=true,
  format='req/m',
).addTarget(
  prometheus.target(
    httpsRequestsPerMinuteSumQuery + 'by (status_code, service)',
    legendFormat='{{service}} | {{status_code}}'
  )
));

local httpRequestsPerMinutePerCacheTypePanel = addSideLegend(graphPanel.new(
  title='Http requests / minute per cache type',
  sort='decreasing',
  format='req/m',
  datasource=cortexDataSource,
).addTarget(
  prometheus.target(
    httpsRequestsPerMinuteSumQuery + 'by (is_cache_warming, service)',
    legendFormat='{{service}} | CacheWarmer:{{is_cache_warming}}'
  )
));
local httpRequestDurationAverageSeconds = addSideLegend(graphPanel.new(
  title='Average http request duration seconds per EA',
  datasource=cortexDataSource,
  format='s',
  sort='decreasing',
).addTarget(
  prometheus.target(
    'sum(rate(http_request_duration_seconds_sum{' + namespaceFilter + '}' + interval + ') / rate(http_request_duration_seconds_count{' + namespaceFilter + '}' + interval + ')) by (service)',
    legendFormat='{{service}}',
  )
));

local wsConnectionActiveGraph = addSideLegend(graphPanel.new(
  title='Active websocket connections per EA',
  sort='decreasing',
  format='conn',
  datasource=cortexDataSource,
).addTarget(
  prometheus.target(
    'sum(ws_connection_active{' + namespaceFilter + '}) by (service)',
    legendFormat='{{service}}',
  ),
));

local wsConnectionErrorsGraph = addSideLegend(graphPanel.new(
  title='Websocket connection errors per EA',
  sort='decreasing',
  format='errors',
  datasource=cortexDataSource,
).addTarget(
  prometheus.target(
    'sum(ws_connection_errors{' + namespaceFilter + '}) by (service)',
    legendFormat='{{service}}',
  ),
));

local wsConnectionRetriesGraph = addSideLegend(graphPanel.new(
  title='Websocket connection retries per EA',
  sort='decreasing',
  format='retries',
  datasource=cortexDataSource,
).addTarget(
  prometheus.target(
    'sum(ws_connection_retries{' + namespaceFilter + '}) by (service)',
    legendFormat='{{service}}',
  )
));

local wsActiveSubscriptions = addSideLegend(graphPanel.new(
  title='Active websocket subscriptions per EA',
  sort='decreasing',
  format='subs',
  stack=true,
  datasource=cortexDataSource
).addTarget(
  prometheus.target(
    'sum(ws_subscription_active{' + namespaceFilter + '}) by (service)',
    legendFormat='{{service}}'
  )
));

local wsMessagesPerSecondGraph = addSideLegend(graphPanel.new(
  title='Websocket messages received / second',
  sort='decreasing',
  format='msg/s',
  datasource=cortexDataSource,
  stack=true,
).addTarget(
  prometheus.target(
    'sum(rate(ws_message_total{' + namespaceFilter + '}' + interval + ')) by (service)',
    legendFormat='{{service}}'
  )
));


local cacheEntrySetsPerSecond = addSideLegend(graphPanel.new(
  title='Cache entry sets per second',
  sort='decreasing',
  format='set/s',
  stack=true,
  datasource=cortexDataSource,
).addTarget(
  prometheus.target(
    'sum(rate(cache_data_set_count{' + namespaceFilter + '}' + interval + ')) by (service)',
    legendFormat='{{service}}',
  )
));


local cacheEntryGetsPerSecond = addSideLegend(graphPanel.new(
  title='Cache entry gets per second',
  sort='decreasing',
  format='get/s',
  stack=true,
  datasource=cortexDataSource,
).addTarget(
  prometheus.target(
    'sum(rate(cache_data_get_count{' + namespaceFilter + '}' + interval + ')) by (service)',
    legendFormat='{{service}}',
  )
));


local cacheValues = addSideLegend(graphPanel.new(
  title='$feed Cache values',
  format='none',
  datasource=cortexDataSource,
  repeat='feed',
).addSeriesOverride(
  {
    alias: '/.*Median.*/',
    color: 'rgb(255, 255, 255)',
    fill: 0,
    linewidth: 2,
    zindex: 3,
  }
).addTargets(
  [
    prometheus.target(
      'quantile(0.5, cache_data_get_values{feed_id=~"$feed.*",namespace="$namespace"}) by (feed_id)',
      legendFormat='Median',
    ),
    prometheus.target(
      'cache_data_get_values{feed_id=~"$feed.*",' + namespaceFilter + '}',
      legendFormat='{{service}}',
    ),
  ]
));

local grid = [
  {
    panels: [
      cpuUsagePanel { size:: 1 },
      heapUsedPanel { size:: 1 },
    ],
    height: 10,
  },
  {
    panels: [
      httpRequestsPerMinutePerFeedPanel { size:: 1 },
    ],
    height: 15,
  },
  {
    panels: [
      httpRequestDurationAverageSeconds { size:: 1 },
    ],
    height: 10,
  },
  {
    panels: [
      httpRequestsPerMinutePerTypePanel { size:: 1 },
      httpRequestsPerMinutePerStatusPanel { size:: 1 },
      httpRequestsPerMinutePerCacheTypePanel { size:: 1 },
    ],
    height: 10,
  },
  {
    panels: [
      redisConnectionsOpen { size:: 1 },
      redisRetriesCount { size:: 1 },
      redisCommandsSentCount { size:: 1 },
      wsConnectionActiveGraph { size:: 1 },
      wsConnectionErrorsGraph { size:: 1 },
      wsConnectionRetriesGraph { size:: 1 },
    ],
    height: 10,
  },
  {
    panels: [
      wsActiveSubscriptions { size:: 1 },
      wsMessagesPerSecondGraph { size:: 1 },
    ],
    height: 10,
  },

  {
    panels: [
      cacheEntrySetsPerSecond { size:: 1 },
      cacheEntryGetsPerSecond { size:: 1 },
    ],
    height: 10,
  },
  {
    panels: [cacheValues { size:: 1 }],
    height: 5,
  },
];

shared.helpers.createDashboard(templates, grid)
