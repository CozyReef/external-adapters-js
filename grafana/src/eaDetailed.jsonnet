// https://grafana.com/docs/grafana/latest/dashboards/json-model/
local grafana = import 'grafonnet/grafana.libsonnet';
local graphPanel = grafana.graphPanel;
local statPanel = grafana.statPanel;
local heatmapPanel = grafana.heatmapPanel;
local barGaugePanel = grafana.barGaugePanel;
local prometheus = grafana.prometheus;

local shared = import './shared.libsonnet';
local addSideLegend = shared.helpers.addSideLegend;

local cortexDataSource = shared.constants.cortexDataSource;
local namespaceFilter = shared.constants.namespaceFilter;
local interval = shared.constants.interval;

local templates = shared.createTemplates(multiService=false);

/**
 * Panels
 */
local cpuUsagePanel = graphPanel.new(
  title='Cpu usage percent',
  datasource=cortexDataSource,
  format='percent'
).addTarget(
  prometheus.target(
    'sum(rate(process_cpu_seconds_total{' + namespaceFilter + '}' + interval + ')) * 100',
    legendFormat='cpu'
  )
);

local redisConnectionsOpen = graphPanel.new(
  title='Redis connections open',
  sort='decreasing',
  datasource=cortexDataSource,
  format='conn',
).addTarget(
  prometheus.target(
    'redis_connections_open{' + namespaceFilter + '}',
    legendFormat='connections open'
  )
);

local redisRetriesCount = addSideLegend(graphPanel.new(
  title='Redis connection retries',
  sort='decreasing',
  datasource=cortexDataSource,
  format='retries',
).addTarget(
  prometheus.target(
    'sum(redis_retries_count{' + namespaceFilter + '})',
    legendFormat='retries'
  )
));


local redisCommandsSentCount = addSideLegend(graphPanel.new(
  title='Redis commands sent / minute per status',
  sort='decreasing',
  datasource=cortexDataSource,
  format='sent',
).addTarget(
  prometheus.target(
    'rate(redis_commands_sent_count{' + namespaceFilter + '}' + interval + ') * 60 ',
    legendFormat='{{status}} {{function_name}}'
  )
));


local heapUsedPanel = graphPanel.new(
  title='Heap usage MB',
  sort='decreasing',
  format='decmbytes',
  datasource=cortexDataSource,
).addTarget(
  prometheus.target(
    'nodejs_heap_size_used_bytes{' + namespaceFilter + '} / 1000 / 1000',
    legendFormat='MB'
  )
);

local httpsRequestsPerMinuteQuery = 'rate(http_requests_total{' + namespaceFilter + '}' + interval + ') * 60 ';
local httpsRequestsPerMinuteSumQuery = 'sum(' + httpsRequestsPerMinuteQuery + ')';


local httpRequestsPerMinutePanel = addSideLegend(graphPanel.new(
  title='Http requests / minute',
  sort='decreasing',
  datasource=cortexDataSource,
  format='req/m',
  stack=true,
).addTarget(
  prometheus.target(
    httpsRequestsPerMinuteQuery,
    legendFormat='{{service}} {{feed_id}} {{status_code}} {{type}} CacheWarmer:{{is_cache_warming}}'
  )
));

local httpRequestsPerMinutePerTypePanel = graphPanel.new(
  title='Http requests / minute per type',
  sort='decreasing',
  datasource=cortexDataSource,
  format='req/m',
).addTarget(
  prometheus.target(
    httpsRequestsPerMinuteSumQuery + 'by (type)',
    legendFormat='{{type}}'
  )
);

local httpRequestsPerMinutePerStatusPanel = graphPanel.new(
  title='Http requests / minute per status code',
  sort='decreasing',
  datasource=cortexDataSource,
  format='req/m',
).addTarget(
  prometheus.target(
    httpsRequestsPerMinuteSumQuery + 'by (status_code)',
    legendFormat='{{status_code}}'
  )
);

local httpRequestsPerMinutePerFeedPanel = addSideLegend(graphPanel.new(
  title='Http requests / minute per feed',
  sort='decreasing',
  datasource=cortexDataSource,
  format='req/m',
  stack=true
).addTarget(
  prometheus.target(
    httpsRequestsPerMinuteSumQuery + 'by (feed_id)',
    legendFormat='{{feed_id}}'
  )
));

local httpRequestsPerMinutePerCacheTypePanel = graphPanel.new(
  title='Http requests / minute per cache type',
  sort='decreasing',
  format='req/m',
  datasource=cortexDataSource,
).addTarget(
  prometheus.target(
    httpsRequestsPerMinuteSumQuery + 'by (is_cache_warming)',
    legendFormat='CacheWarmer:{{is_cache_warming}}'
  )
);

local httpRequestDurationAverageSeconds = graphPanel.new(
  title='Average http request duration seconds',
  format='s',
  datasource=cortexDataSource,
  sort='decreasing',
).addTarget(
  prometheus.target(
    'rate(http_request_duration_seconds_sum{' + namespaceFilter + '}' + interval + ')/rate(http_request_duration_seconds_count{' + namespaceFilter + '}' + interval + ')',
    legendFormat='{{service}}',
  )
);
local httpRequestDurationSecondsHeatmap = heatmapPanel.new(
  title='Http request duration seconds heatmap',
  datasource=cortexDataSource,
  dataFormat='tsbuckets',
  color_colorScheme='interpolateInferno',
  maxDataPoints=25,
  yAxis_logBase=2,
).addTarget(
  prometheus.target(
    'sum(increase(http_request_duration_seconds_bucket{' + namespaceFilter + '}[$__interval])) by (le)',
    legendFormat='{{le}}',
    format='heatmap',
  )
);

local wsConnectionActiveGraph = graphPanel.new(
  title='Active websocket connections',
  sort='decreasing',
  format='conn',
  datasource=cortexDataSource,
).addTarget(
  prometheus.target(
    'ws_connection_active{' + namespaceFilter + '}',
    legendFormat='{{service}} | Key:{{key}}',
  ),
);

local wsConnectionErrorsGraph = graphPanel.new(
  title='Websocket connection errors',
  sort='decreasing',
  format='errors',
  datasource=cortexDataSource,
).addTarget(
  prometheus.target(
    'ws_connection_errors{' + namespaceFilter + '}',
    legendFormat='{{service}} | Key:{{key}}',
  ),
);

local wsConnectionRetriesGraph = graphPanel.new(
  title='Websocket connection retries',
  sort='decreasing',
  format='retries',
  datasource=cortexDataSource,
).addTarget(
  prometheus.target(
    'ws_connection_retries{' + namespaceFilter + '}',

    legendFormat='{{service}} | Key:{{key}}',
  )
);

local wsActiveSubscriptions = addSideLegend(graphPanel.new(
  title='Active websocket subscriptions',
  sort='decreasing',
  stack=true,
  format='subs',
  datasource=cortexDataSource
).addTarget(
  prometheus.target(
    'ws_subscription_active{' + namespaceFilter + '}',
    legendFormat='{{service}} | ConnKey: {{ connection_key }} ConnUrl: {{ connection_url }} Feed: {{feed_id}}'
  )
));

local wsMessagesPerSecondGraph = addSideLegend(graphPanel.new(
  title='Websocket messages received / second',
  sort='decreasing',
  datasource=cortexDataSource,
  format='msg/s',
  stack=true,
).addTarget(
  prometheus.target(
    'rate(ws_message_total{' + namespaceFilter + '}' + interval + ')',
    legendFormat='{{service}} | Feed: {{feed_id}}'
  )
));

local cacheFeedValues = statPanel.new(
  title='Cached feed values',
  datasource=cortexDataSource,
  reducerFunction='lastNotNull',
  unit='short'
).addTarget(
  prometheus.target(
    'cache_data_get_values{' + namespaceFilter + '}',
    legendFormat='{{feed_id}}',
  )
);

local barGaugeConfig = {
  fieldConfig+: {
    defaults+: {
      color: {
        mode: 'continuous-GrYlRd',
      },
    },
  },
  options: {
    reduceOptions: {
      values: false,
      calcs: [
        'lastNotNull',
      ],
      fields: '',
    },
    orientation: 'horizontal',
    text: {},
    displayMode: 'gradient',
    showUnfilled: true,
  },
};

local cacheMaxAgeSeconds = barGaugePanel.new(
  title='Max age per cache entry',
  datasource=cortexDataSource,
  unit='s'
).addTarget(
  prometheus.target(
    'sort_desc(cache_data_max_age{' + namespaceFilter + '}/1000) != 0',
    instant=true,
    legendFormat='{{feed_id}}',
  )
) + barGaugeConfig;

local cacheStalenessSeconds = barGaugePanel.new(
  title='Staleness per cache entry',
  datasource=cortexDataSource,
  unit='s'
).addTarget(
  prometheus.target(
    'sort_desc(cache_data_staleness_seconds{' + namespaceFilter + '}) != 0',
    instant=true,
    legendFormat='{{feed_id}}',
  )
) + barGaugeConfig;

local cacheEntrySetsPerSecond = addSideLegend(graphPanel.new(
  title='Cache entry sets per second',
  sort='decreasing',
  stack=true,
  format='set/s',
  datasource=cortexDataSource
).addTarget(
  prometheus.target(
    'rate(cache_data_set_count{' + namespaceFilter + '}' + interval + ')',
    legendFormat='{{feed_id}}',
  )
));


local cacheEntryGetsPerSecond = addSideLegend(graphPanel.new(
  title='Cache entry gets per second',
  sort='decreasing',
  stack=true,
  datasource=cortexDataSource,
  format='get/s',
).addTarget(
  prometheus.target(
    'rate(cache_data_get_count{' + namespaceFilter + '}' + interval + ')',
    legendFormat='{{feed_id}}',
  )
));

local grid = [
  {
    panels: [
      cpuUsagePanel { size:: 1 },
      heapUsedPanel { size:: 1 },
    ],
    height: 7.5,
  },
  {
    panels: [httpRequestsPerMinutePanel { size:: 1 }],
    height: 12.5,
  },
  {
    panels: [
      httpRequestDurationAverageSeconds { size:: 1 },
      httpRequestDurationSecondsHeatmap { size:: 1 },
    ],
    height: 7.5,
  },
  {
    panels: [
      httpRequestsPerMinutePerTypePanel { size:: 1 },
      httpRequestsPerMinutePerStatusPanel { size:: 1 },
      httpRequestsPerMinutePerFeedPanel { size:: 1 },
      httpRequestsPerMinutePerCacheTypePanel { size:: 1 },
    ],
    height: 7.5,
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
    height: 7.5,
  },
  {
    panels: [
      wsActiveSubscriptions { size:: 1 },
      wsMessagesPerSecondGraph { size:: 1 },
    ],
    height: 7.5,
  },
  {
    panels: [
      cacheFeedValues { size:: 1 },
    ],
    height: 12.5,
  },
  {
    panels: [
      cacheMaxAgeSeconds { size:: 1 },
      cacheStalenessSeconds { size:: 1 },
    ],
    height: 7.5,
  },
  {
    panels: [
      cacheEntrySetsPerSecond { size:: 1 },
      cacheEntryGetsPerSecond { size:: 1 },
    ],
    height: 7.5,
  },
];

shared.helpers.createDashboard(templates, grid)
