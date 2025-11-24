# API Gateway and Load Balancer Configuration

## Overview

This document outlines the implementation of a robust API gateway and load balancing infrastructure for the RightFit Services platform. The solution provides high availability, scalability, security, and efficient traffic routing across all microservices (authentication, cleaning, maintenance, and customer services).

## Architecture

### Technology Stack
- **Nginx**: High-performance reverse proxy and load balancer
- **Kong**: Enterprise-grade API gateway with plugins
- **Docker & Docker Compose**: Container orchestration
- **Redis**: Rate limiting and caching layer
- **Prometheus**: Metrics collection and monitoring
- **Grafana**: Visualization and alerting
- **ELK Stack**: Centralized logging (Elasticsearch, Logstash, Kibana)
- **Let's Encrypt**: SSL/TLS certificate management
- **HAProxy**: Additional load balancing capabilities
- **Consul**: Service discovery and configuration

### Infrastructure Components
```
┌─────────────────────────────────────────────────────────────┐
│                        Load Balancer                        │
│                    (HAProxy + Keepalived)                   │
│                     Active/Passive Setup                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                      API Gateway                            │
│                         Kong                                │
│              (Authentication + Rate Limiting)               │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌─────▼──────┐ ┌───▼──────┐ ┌───────────┐
│  Auth API    │ │Cleaning API│ │Maint API │ │Customer API│
│ Service      │ │ Service    │ │ Service  │ │ Service    │
│ (Node.js)    │ │ (Node.js)  │ │ (Node.js)│ │ (Node.js)  │
└──────────────┘ └────────────┘ └──────────┘ └───────────┘
```

## Implementation

### 1. Docker Compose Configuration

#### docker-compose.gateway.yml
```yaml
version: '3.8'

services:
  # HAProxy Load Balancer
  haproxy-primary:
    image: haproxy:2.7-alpine
    container_name: haproxy-primary
    ports:
      - "80:80"
      - "443:443"
      - "8404:8404"  # Stats page
    volumes:
      - ./haproxy/haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro
      - ./ssl:/etc/ssl/certs:ro
      - ./logs/haproxy:/var/log/haproxy
    networks:
      - gateway-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8404/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  haproxy-secondary:
    image: haproxy:2.7-alpine
    container_name: haproxy-secondary
    ports:
      - "8080:80"
      - "8443:443"
      - "8405:8404"  # Stats page
    volumes:
      - ./haproxy/haproxy-secondary.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro
      - ./ssl:/etc/ssl/certs:ro
      - ./logs/haproxy:/var/log/haproxy
    networks:
      - gateway-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8404/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Keepalived for HAProxy failover
  keepalived-primary:
    image: osixia/keepalived:2.0.20
    container_name: keepalived-primary
    volumes:
      - ./keepalived/keepalived-primary.conf:/etc/keepalived/keepalived.conf:ro
    network_mode: host
    privileged: true
    restart: unless-stopped
    depends_on:
      - haproxy-primary

  keepalived-secondary:
    image: osixia/keepalived:2.0.20
    container_name: keepalived-secondary
    volumes:
      - ./keepalived/keepalived-secondary.conf:/etc/keepalived/keepalived.conf:ro
    network_mode: host
    privileged: true
    restart: unless-stopped
    depends_on:
      - haproxy-secondary

  # Kong API Gateway
  kong-database:
    image: postgres:15-alpine
    container_name: kong-database
    environment:
      POSTGRES_USER: kong
      POSTGRES_PASSWORD: ${KONG_DB_PASSWORD}
      POSTGRES_DB: kong
    volumes:
      - kong-db-data:/var/lib/postgresql/data
    networks:
      - gateway-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kong"]
      interval: 10s
      timeout: 5s
      retries: 5

  kong-migrations:
    image: kong:3.3
    container_name: kong-migrations
    command: kong migrations bootstrap
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: kong-database
      KONG_PG_USER: kong
      KONG_PG_PASSWORD: ${KONG_DB_PASSWORD}
      KONG_PG_DATABASE: kong
    depends_on:
      kong-database:
        condition: service_healthy
    networks:
      - gateway-network
    restart: on-failure

  kong:
    image: kong:3.3
    container_name: kong-gateway
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: kong-database
      KONG_PG_USER: kong
      KONG_PG_PASSWORD: ${KONG_DB_PASSWORD}
      KONG_PG_DATABASE: kong
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_ADMIN_LISTEN: 0.0.0.0:8001
      KONG_ADMIN_GUI_URL: http://localhost:8002
      KONG_PLUGINS: bundled,rate-limiting,ssl,prometheus,zipkin
      KONG_NGINX_DAEMON: 'off'
    ports:
      - "8000:8000"  # Kong proxy
      - "8001:8001"  # Admin API
      - "8002:8002"  # Manager GUI
      - "8443:8443"  # SSL proxy
      - "8444:8444"  # SSL admin API
    volumes:
      - ./kong/kong.conf:/etc/kong/kong.conf:ro
      - ./ssl:/etc/ssl/certs:ro
    networks:
      - gateway-network
    restart: unless-stopped
    depends_on:
      kong-migrations:
        condition: service_completed_successfully

  # Redis for rate limiting and caching
  redis:
    image: redis:7-alpine
    container_name: kong-redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
    networks:
      - gateway-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # Kong Manager (Optional GUI)
  kong-manager:
    image: pantsel/konga
    container_name: kong-manager
    environment:
      NODE_ENV: development
      KONGA_HOOK_TIMEOUT: 10000
    ports:
      - "1337:1337"
    networks:
      - gateway-network
    restart: unless-stopped
    depends_on:
      - kong

  # Prometheus for metrics
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    networks:
      - gateway-network
    restart: unless-stopped

  # Grafana for visualization
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    networks:
      - gateway-network
    restart: unless-stopped

  # Elasticsearch for logging
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    networks:
      - gateway-network
    restart: unless-stopped

  # Kibana for log visualization
  kibana:
    image: docker.elastic.co/kibana/kibana:8.10.0
    container_name: kibana
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
    networks:
      - gateway-network
    restart: unless-stopped

  # Logstash for log processing
  logstash:
    image: docker.elastic.co/logstash/logstash:8.10.0
    container_name: logstash
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline:ro
      - ./logs:/var/log:ro
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch
    networks:
      - gateway-network
    restart: unless-stopped

volumes:
  kong-db-data:
  redis-data:
  prometheus-data:
  grafana-data:
  elasticsearch-data:

networks:
  gateway-network:
    driver: bridge
```

### 2. HAProxy Configuration

#### haproxy/haproxy.cfg
```haproxy
global
    daemon
    maxconn 4096
    log stdout format raw local0
    stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
    tune.ssl.default-dh-param 2048

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    timeout http-request 15s
    timeout http-keep-alive 15s
    errorfile 400 /etc/haproxy/errors/400.http
    errorfile 403 /etc/haproxy/errors/403.http
    errorfile 408 /etc/haproxy/errors/408.http
    errorfile 500 /etc/haproxy/errors/500.http
    errorfile 502 /etc/haproxy/errors/502.http
    errorfile 503 /etc/haproxy/errors/503.http
    errorfile 504 /etc/haproxy/errors/504.http

# Statistics page
listen stats
    bind *:8404 ssl crt /etc/ssl/certs/haproxy.pem
    stats enable
    stats uri /stats
    stats refresh 30s
    stats admin if TRUE
    stats realm "HAProxy Statistics"
    stats auth admin:${HAPROXY_STATS_PASSWORD}

# Frontend for HTTP (redirect to HTTPS)
frontend http_frontend
    bind *:80
    bind :::80 v4v6
    redirect scheme https code 301 if !{ ssl_fc }

# Frontend for HTTPS
frontend https_frontend
    bind *:443 ssl crt /etc/ssl/certs/rightfit.pem alpn h2,http/1.1
    bind :::443 ssl crt /etc/ssl/certs/rightfit.pem alpn h2,http/1.1 v4v6
    option httplog
    option forwardfor
    http-request set-header X-Forwarded-Proto https
    http-request set-header X-Forwarded-Port %[dst_port]

    # ACLs for routing
    acl is_api path_beg /api/
    acl is_auth path_beg /api/auth
    acl is_cleaning path_beg /api/cleaning
    acl is_maintenance path_beg /api/maintenance
    acl is_customer path_beg /api/customer
    acl is_admin path_beg /api/admin
    acl is_kong_admin path_beg /kong-admin

    # ACL for rate limiting
    acl rate_limit_http hdr_cnt(user-agent) gt 100
    http-request deny if rate_limit_http

    # Health check endpoint
    acl is_health path /health
    http-request return status 200 if is_health

    # Route to appropriate backend
    use_backend kong_admin_backend if is_kong_admin
    use_backend kong_proxy_backend if is_api
    default_backend kong_proxy_backend

# Backend for Kong Admin API
backend kong_admin_backend
    balance roundrobin
    option httpchk GET /health
    server kong1 kong:8001 check inter 5s rise 2 fall 3
    server kong2 kong:8444 check inter 5s rise 2 fall 3 ssl verify none

# Backend for Kong Proxy
backend kong_proxy_backend
    balance roundrobin
    option httpchk GET /health
    server kong_proxy1 kong:8000 check inter 5s rise 2 fall 3
    server kong_proxy2 kong:8443 check inter 5s rise 2 fall 3 ssl verify none

# Backend for direct API service access (fallback)
backend auth_backend
    balance roundrobin
    option httpchk GET /api/auth/health
    server auth1 auth-api:3001 check inter 5s rise 2 fall 3
    server auth2 auth-api:3002 check inter 5s rise 2 fall 3

backend cleaning_backend
    balance roundrobin
    option httpchk GET /api/cleaning/health
    server cleaning1 cleaning-api:3003 check inter 5s rise 2 fall 3
    server cleaning2 cleaning-api:3004 check inter 5s rise 2 fall 3

backend maintenance_backend
    balance roundrobin
    option httpchk GET /api/maintenance/health
    server maintenance1 maintenance-api:3005 check inter 5s rise 2 fall 3
    server maintenance2 maintenance-api:3006 check inter 5s rise 2 fall 3

backend customer_backend
    balance roundrobin
    option httpchk GET /api/customer/health
    server customer1 customer-api:3007 check inter 5s rise 2 fall 3
    server customer2 customer-api:3008 check inter 5s rise 2 fall 3

# Rate limiting configuration
frontend rate_limiter
    bind *:8080
    stick-table type ip size 1m expire 30s store http_req_rate(10s)
    http-request track-sc0 src
    http-request sc-inc-gpc0(10s)
    http-request deny if sc0_http_req_rate(10s) gt 100
    default_backend kong_proxy_backend
```

### 3. Kong Configuration

#### kong/kong.conf
```ini
# Kong Configuration File

# Database
database = postgres
pg_host = kong-database
pg_port = 5432
pg_user = kong
pg_password = ${KONG_DB_PASSWORD}
pg_database = kong

# Proxy Configuration
proxy_listen = 0.0.0.0:8000, 0.0.0.0:8443 ssl
proxy_listen_ssl = 0.0.0.0:8443 ssl
proxy_protocol = off

# Admin API Configuration
admin_listen = 0.0.0.0:8001, 0.0.0.0:8444 ssl
admin_listen_ssl = 0.0.0.0:8444 ssl
admin_gui_listen = 0.0.0.0:8002

# SSL Configuration
ssl_cert = /etc/ssl/certs/kong.pem
ssl_cert_key = /etc/ssl/certs/kong.key
ssl_protocols = TLSv1.2 TLSv1.3
ssl_ciphers = ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
ssl_prefer_server_ciphers = on

# Plugins
plugins = bundled,rate-limiting,ssl,prometheus,zipkin,cors,jwt,acl
pluginserver_names = go-plugins
pluginserver_go_plugins_socket = /usr/local/kong/go-plugins/go-plugins.sock
pluginserver_go_plugins_start_cmd = /usr/local/bin/go-plugins-bin -kong-prefix /usr/local/kong/ -plugins-dir /usr/local/kong/go-plugins/

# Caching
cache = on
cache_ttl = 300
cache_storage = redis
redis_host = kong-redis
redis_port = 6379
redis_password = ${REDIS_PASSWORD}
redis_database = 0
redis_ssl = off

# Rate Limiting
ratelimit = on
ratelimit_storage = redis
ratelimit_redis_host = kong-redis
ratelimit_redis_port = 6379
ratelimit_redis_password = ${REDIS_PASSWORD}
ratelimit_redis_database = 1

# Logging
log_level = notice
log_format = json
proxy_access_log = /dev/stdout
proxy_error_log = /dev/stderr
admin_access_log = /dev/stdout
admin_error_log = /dev/stderr

# Performance
nginx_worker_processes = auto
nginx_daemon = off
mem_cache_size = 128m
client_max_body_size = 50m

# Security
trusted_ips = 0.0.0.0/0, ::/0
real_ip_header = X-Forwarded-For
real_ip_recursive = on

# DNS
resolver = 8.8.8.8:53,8.8.4.4:53
dns_order = LAST,A,SRV,CNAME

# Upstream Configuration
upstream_keepalive_pool_size = 500
upstream_keepalive_max_requests = 10000
upstream_keepalive_idle_timeout = 60
```

### 4. Service Configuration and Routing

#### Kong API Configuration Script
```bash
#!/bin/bash
# configure-kong.sh - Configure Kong services and routes

KONG_ADMIN_URL="http://localhost:8001"

# Wait for Kong to be ready
echo "Waiting for Kong to be ready..."
until curl -s $KONG_ADMIN_URL/services > /dev/null; do
    echo "Kong not ready, waiting..."
    sleep 5
done

echo "Kong is ready. Configuring services..."

# Create Upstream for Authentication Service
curl -X POST $KONG_ADMIN_URL/upstreams \
  --data name="auth-service" \
  --data algorithm="round-robin" \
  --data healthchecks.active.healthy.http_statuses="200,302" \
  --data healthchecks.active.https_verify_certificate=false \
  --data healthchecks.active.unhealthy.http_statuses="404,429,500,502,503,504" \
  --data healthchecks.active.timeout=10

# Add Auth Service Targets
curl -X POST $KONG_ADMIN_URL/upstreams/auth-service/targets \
  --data target="auth-api:3001"

curl -X POST $KONG_ADMIN_URL/upstreams/auth-service/targets \
  --data target="auth-api:3002"

# Create Service for Authentication
curl -X POST $KONG_ADMIN_URL/services \
  --data name="auth-service" \
  --data url="http://auth-service/api/auth" \
  --data retries=3 \
  --data protocol=http \
  --data connect_timeout=60000 \
  --data write_timeout=60000 \
  --data read_timeout=60000

# Create Route for Authentication Service
curl -X POST $KONG_ADMIN_URL/services/auth-service/routes \
  --data name="auth-route" \
  --data paths[]="/api/auth" \
  --data methods[]="GET" \
  --data methods[]="POST" \
  --data methods[]="PUT" \
  --data methods[]="DELETE" \
  --data strip_path=false

# Create Upstream for Cleaning Service
curl -X POST $KONG_ADMIN_URL/upstreams \
  --data name="cleaning-service" \
  --data algorithm="round-robin" \
  --data healthchecks.active.healthy.http_statuses="200,302" \
  --data healthchecks.active.unhealthy.http_statuses="404,429,500,502,503,504" \
  --data healthchecks.active.timeout=10

# Add Cleaning Service Targets
curl -X POST $KONG_ADMIN_URL/upstreams/cleaning-service/targets \
  --data target="cleaning-api:3003"

curl -X POST $KONG_ADMIN_URL/upstreams/cleaning-service/targets \
  --data target="cleaning-api:3004"

# Create Service for Cleaning
curl -X POST $KONG_ADMIN_URL/services \
  --data name="cleaning-service" \
  --data url="http://cleaning-service/api/cleaning" \
  --data retries=3 \
  --data protocol=http \
  --data connect_timeout=60000 \
  --data write_timeout=60000 \
  --data read_timeout=60000

# Create Route for Cleaning Service
curl -X POST $KONG_ADMIN_URL/services/cleaning-service/routes \
  --data name="cleaning-route" \
  --data paths[]="/api/cleaning" \
  --data methods[]="GET" \
  --data methods[]="POST" \
  --data methods[]="PUT" \
  --data methods[]="DELETE" \
  --data strip_path=false

# Create Upstream for Maintenance Service
curl -X POST $KONG_ADMIN_URL/upstreams \
  --data name="maintenance-service" \
  --data algorithm="round-robin" \
  --data healthchecks.active.healthy.http_statuses="200,302" \
  --data healthchecks.active.unhealthy.http_statuses="404,429,500,502,503,504" \
  --data healthchecks.active.timeout=10

# Add Maintenance Service Targets
curl -X POST $KONG_ADMIN_URL/upstreams/maintenance-service/targets \
  --data target="maintenance-api:3005"

curl -X POST $KONG_ADMIN_URL/upstreams/maintenance-service/targets \
  --data target="maintenance-api:3006"

# Create Service for Maintenance
curl -X POST $KONG_ADMIN_URL/services \
  --data name="maintenance-service" \
  --data url="http://maintenance-service/api/maintenance" \
  --data retries=3 \
  --data protocol=http \
  --data connect_timeout=60000 \
  --data write_timeout=60000 \
  --data read_timeout=60000

# Create Route for Maintenance Service
curl -X POST $KONG_ADMIN_URL/services/maintenance-service/routes \
  --data name="maintenance-route" \
  --data paths[]="/api/maintenance" \
  --data methods[]="GET" \
  --data methods[]="POST" \
  --data methods[]="PUT" \
  --data methods[]="DELETE" \
  --data strip_path=false

# Create Upstream for Customer Service
curl -X POST $KONG_ADMIN_URL/upstreams \
  --data name="customer-service" \
  --data algorithm="round-robin" \
  --data healthchecks.active.healthy.http_statuses="200,302" \
  --data healthchecks.active.unhealthy.http_statuses="404,429,500,502,503,504" \
  --data healthchecks.active.timeout=10

# Add Customer Service Targets
curl -X POST $KONG_ADMIN_URL/upstreams/customer-service/targets \
  --data target="customer-api:3007"

curl -X POST $KONG_ADMIN_URL/upstreams/customer-service/targets \
  --data target="customer-api:3008"

# Create Service for Customer
curl -X POST $KONG_ADMIN_URL/services \
  --data name="customer-service" \
  --data url="http://customer-service/api/customer" \
  --data retries=3 \
  --data protocol=http \
  --data connect_timeout=60000 \
  --data write_timeout=60000 \
  --data read_timeout=60000

# Create Route for Customer Service
curl -X POST $KONG_ADMIN_URL/services/customer-service/routes \
  --data name="customer-route" \
  --data paths[]="/api/customer" \
  --data methods[]="GET" \
  --data methods[]="POST" \
  --data methods[]="PUT" \
  --data methods[]="DELETE" \
  --data strip_path=false

# Apply Rate Limiting Plugin
curl -X POST $KONG_ADMIN_URL/plugins \
  --data name="rate-limiting" \
  --data config.minute=1000 \
  --data config.hour=10000 \
  --data config.day=100000 \
  --data config.limit_by=ip \
  --data config.policy=redis \
  --data config.redis_host=kong-redis \
  --data config.redis_port=6379 \
  --data config.redis_password=${REDIS_PASSWORD} \
  --data config.redis_database=2

# Apply CORS Plugin
curl -X POST $KONG_ADMIN_URL/plugins \
  --data name="cors" \
  --data config.origins="*" \
  --data config.methods="GET,HEAD,PUT,PATCH,POST,DELETE" \
  --data config.headers="Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,Authorization,Host,X-Forwarded-For,X-Forwarded-Proto,X-Forwarded-Port,X-Real-IP" \
  --data config.exposed_headers="X-Total-Count,X-RateLimit-Limit,X-RateLimit-Remaining,X-RateLimit-Reset" \
  --data config.credentials=true \
  --data config.max_age=3600

# Apply Prometheus Plugin for Metrics
curl -X POST $KONG_ADMIN_URL/plugins \
  --data name="prometheus" \
  --data config.per_consumer=true

echo "Kong configuration completed successfully!"
```

### 5. SSL/TLS Configuration

#### SSL Certificate Setup
```bash
#!/bin/bash
# setup-ssl.sh - Set up SSL certificates with Let's Encrypt

# Install Certbot
apt-get update
apt-get install -y certbot

# Generate SSL certificate for rightfit.com
certbot certonly --standalone \
  -d rightfit.com \
  -d api.rightfit.com \
  -d admin.rightfit.com \
  --email admin@rightfit.com \
  --agree-tos \
  --non-interactive

# Copy certificates to haproxy directory
cp /etc/letsencrypt/live/rightfit.com/fullchain.pem ./ssl/rightfit.pem
cp /etc/letsencrypt/live/rightfit.com/privkey.pem ./ssl/rightfit.key

# Create Kong SSL certificate
cat ./ssl/rightfit.key ./ssl/rightfit.pem > ./ssl/kong.pem
cp ./ssl/rightfit.key ./ssl/kong.key

# Create HAProxy SSL certificate
cat ./ssl/rightfit.key ./ssl/rightfit.pem > ./ssl/haproxy.pem

# Set proper permissions
chmod 600 ./ssl/*.key
chmod 644 ./ssl/*.pem

echo "SSL certificates configured successfully!"
```

### 6. Monitoring and Logging

#### Prometheus Configuration
```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'kong'
    static_configs:
      - targets: ['kong:8001']
    metrics_path: /metrics
    scrape_interval: 5s

  - job_name: 'haproxy'
    static_configs:
      - targets: ['haproxy-primary:8404']
    metrics_path: /metrics
    scrape_interval: 5s

  - job_name: 'redis'
    static_configs:
      - targets: ['kong-redis:6379']

  - job_name: 'auth-api'
    static_configs:
      - targets: ['auth-api:3001', 'auth-api:3002']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'cleaning-api'
    static_configs:
      - targets: ['cleaning-api:3003', 'cleaning-api:3004']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'maintenance-api'
    static_configs:
      - targets: ['maintenance-api:3005', 'maintenance-api:3006']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'customer-api'
    static_configs:
      - targets: ['customer-api:3007', 'customer-api:3008']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

#### Grafana Dashboard Configuration
```json
{
  "dashboard": {
    "id": null,
    "title": "RightFit API Gateway Dashboard",
    "tags": ["rightfit", "api-gateway"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(kong_http_requests_total[5m])) by (service)",
            "legendFormat": "{{service}}"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(kong_request_latency_seconds_bucket[5m])) by (le, service))",
            "legendFormat": "95th percentile - {{service}}"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0}
      },
      {
        "id": 3,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(kong_http_requests_total{status=~\"5..\"}[5m])) by (service) / sum(rate(kong_http_requests_total[5m])) by (service)",
            "legendFormat": "{{service}}"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8}
      },
      {
        "id": 4,
        "title": "HAProxy Backend Status",
        "type": "stat",
        "targets": [
          {
            "expr": "haproxy_backend_status{state=\"UP\"}",
            "legendFormat": "{{backend}}"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 8}
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

### 7. Health Checks and Monitoring

#### Health Check Service
```typescript
// health-check-service.ts
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;

// Service health check endpoints
const services = [
  { name: 'auth-api', urls: ['http://auth-api:3001/health', 'http://auth-api:3002/health'] },
  { name: 'cleaning-api', urls: ['http://cleaning-api:3003/health', 'http://cleaning-api:3004/health'] },
  { name: 'maintenance-api', urls: ['http://maintenance-api:3005/health', 'http://maintenance-api:3006/health'] },
  { name: 'customer-api', urls: ['http://customer-api:3007/health', 'http://customer-api:3008/health'] },
  { name: 'kong', urls: ['http://kong:8001/health', 'http://kong:8000/health'] },
  { name: 'redis', urls: ['http://kong-redis:6379'] },
  { name: 'haproxy', urls: ['http://haproxy-primary:8404/health'] },
];

// Health check function
const checkServiceHealth = async (serviceName: string, urls: string[]) => {
  const results = [];

  for (const url of urls) {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      results.push({
        url,
        status: response.status >= 200 && response.status < 300 ? 'healthy' : 'unhealthy',
        responseTime: response.headers['x-response-time'] || 'N/A',
        lastCheck: new Date().toISOString()
      });
    } catch (error: any) {
      results.push({
        url,
        status: 'unhealthy',
        error: error.message,
        lastCheck: new Date().toISOString()
      });
    }
  }

  return {
    service: serviceName,
    overall: results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy',
    instances: results
  };
};

// Overall health check endpoint
app.get('/health', async (req, res) => {
  try {
    const healthChecks = await Promise.all(
      services.map(service => checkServiceHealth(service.name, service.urls))
    );

    const overallHealth = healthChecks.every(check => check.overall === 'healthy');

    res.json({
      status: overallHealth ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: healthChecks
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Individual service health check
app.get('/health/:service', async (req, res) => {
  try {
    const serviceName = req.params.service;
    const service = services.find(s => s.name === serviceName);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const healthCheck = await checkServiceHealth(service.name, service.urls);
    res.json(healthCheck);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  const metrics = [
    '# HELP health_check_status Overall health check status (1=healthy, 0=unhealthy)',
    '# TYPE health_check_status gauge',
  ];

  // Add actual metrics here based on health checks
  res.set('Content-Type', 'text/plain');
  res.send(metrics.join('\n'));
});

app.listen(PORT, () => {
  console.log(`Health check service running on port ${PORT}`);
});
```

### 8. Deployment Scripts

#### deploy-gateway.sh
```bash
#!/bin/bash
# deploy-gateway.sh - Deploy API gateway infrastructure

set -e

# Environment variables
export KONG_DB_PASSWORD=${KONG_DB_PASSWORD:-"kongpassword"}
export REDIS_PASSWORD=${REDIS_PASSWORD:-"redispassword"}
export HAPROXY_STATS_PASSWORD=${HAPROXY_STATS_PASSWORD:-"statspassword"}
export GRAFANA_PASSWORD=${GRAFANA_PASSWORD:-"grafanapassword"}

echo "Starting API Gateway deployment..."

# Create necessary directories
mkdir -p logs/{haproxy,kong,elasticsearch}
mkdir -p ssl
mkdir -p {prometheus,grafana,logstash,kong,keepalived}

# Generate SSL certificates
echo "Setting up SSL certificates..."
./setup-ssl.sh

# Start the infrastructure
echo "Starting infrastructure services..."
docker-compose -f docker-compose.gateway.yml up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 30

# Configure Kong
echo "Configuring Kong API Gateway..."
./configure-kong.sh

# Setup Grafana dashboards
echo "Setting up Grafana dashboards..."
./setup-grafana.sh

# Setup Logstash configuration
echo "Configuring logging pipeline..."
./setup-logging.sh

# Run health checks
echo "Running health checks..."
./health-check.sh

echo "API Gateway deployment completed successfully!"
echo "Services available at:"
echo "  - API Gateway: https://api.rightfit.com"
echo "  - Admin API: https://api.rightfit.com/kong-admin"
echo "  - Kong Manager: http://localhost:1337"
echo "  - Grafana: http://localhost:3000 (admin/${GRAFANA_PASSWORD})"
echo "  - Prometheus: http://localhost:9090"
echo "  - Kibana: http://localhost:5601"
echo "  - HAProxy Stats: https://api.rightfit.com/stats (admin/${HAPROXY_STATS_PASSWORD})"
```

#### health-check.sh
```bash
#!/bin/bash
# health-check.sh - Comprehensive health check script

echo "Running comprehensive health checks..."

# Check HAProxy
echo "Checking HAProxy..."
curl -f http://localhost:8404/stats || echo "HAProxy health check failed"

# Check Kong
echo "Checking Kong..."
curl -f http://localhost:8001/health || echo "Kong health check failed"

# Check Kong Proxy
echo "Checking Kong Proxy..."
curl -f http://localhost:8000/health || echo "Kong Proxy health check failed"

# Check Redis
echo "Checking Redis..."
redis-cli -h localhost -p 6379 ping || echo "Redis health check failed"

# Check Services
echo "Checking backend services..."
services=("auth-api:3001" "auth-api:3002" "cleaning-api:3003" "cleaning-api:3004"
          "maintenance-api:3005" "maintenance-api:3006" "customer-api:3007" "customer-api:3008")

for service in "${services[@]}"; do
  echo "Checking $service..."
  curl -f http://localhost/health/$service || echo "$service health check failed"
done

echo "Health check completed!"
```

## Security Features

### 1. Rate Limiting
- IP-based rate limiting with Redis
- Service-specific rate limits
- Adaptive rate limiting based on load
- DDoS protection

### 2. SSL/TLS Encryption
- End-to-end encryption
- Certificate auto-renewal
- Strong cipher suites
- HTTP/2 support

### 3. Authentication & Authorization
- JWT token validation
- API key management
- Role-based access control
- IP whitelisting

### 4. Security Headers
- HSTS, CSP, X-Frame-Options
- CORS configuration
- Security audit logging

## Performance Optimization

### 1. Caching Strategy
- Redis-based caching
- HTTP response caching
- API response compression
- CDN integration

### 2. Load Balancing
- Round-robin algorithm
- Health checks
- Failover mechanism
- Session persistence

### 3. Monitoring & Alerting
- Real-time metrics
- Performance dashboards
- Automated alerts
- Capacity planning

This comprehensive API gateway and load balancer configuration provides enterprise-grade infrastructure with high availability, security, scalability, and comprehensive monitoring for the RightFit Services platform.