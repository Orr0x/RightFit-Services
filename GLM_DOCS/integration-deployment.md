# Integration & Deployment

## Overview

This document outlines the implementation of comprehensive CI/CD pipelines, container orchestration, and environment management for the RightFit Services platform. The solution provides automated testing, deployment, and monitoring across development, staging, and production environments.

## Architecture

### Technology Stack
- **GitHub Actions**: CI/CD pipeline automation
- **Docker**: Containerization and image management
- **Kubernetes**: Container orchestration and management
- **Helm**: Kubernetes package management
- **Terraform**: Infrastructure as Code (IaC)
- **Ansible**: Configuration management
- **Jenkins**: Alternative CI/CD pipeline orchestration
- **ArgoCD**: GitOps continuous delivery
- **Prometheus**: Monitoring and alerting
- **Grafana**: Visualization and dashboards
- **Vault**: Secret management
- **Fluentd**: Log aggregation and forwarding

### CI/CD Pipeline Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │───▶│     Testing     │───▶│   Staging       │
│   (main branch) │    │  (pull requests)│    │  (staging branch)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Code Commit   │    │  Automated      │    │   Integration   │
│   & Push        │    │  Tests          │    │   Tests         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Build Image   │    │  Security Scan  │    │   Deploy to     │
│   & Tag         │    │  & Analysis     │    │   Staging       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                           │
                                                           ▼
                                                ┌─────────────────┐
                                                │   Production    │
                                                │   (main branch) │
                                                └─────────────────┘
```

## Implementation

### 1. GitHub Actions Workflows

#### Main CI/CD Pipeline
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [auth-api, cleaning-api, maintenance-api, customer-api, web-customer, web-maintenance, web-worker]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/${{ matrix.service }}/package-lock.json

      - name: Install dependencies
        run: |
          cd apps/${{ matrix.service }}
          npm ci

      - name: Run linting
        run: |
          cd apps/${{ matrix.service }}
          npm run lint

      - name: Run unit tests
        run: |
          cd apps/${{ matrix.service }}
          npm run test:unit

      - name: Run integration tests
        run: |
          cd apps/${{ matrix.service }}
          npm run test:integration

      - name: Upload test coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./apps/${{ matrix.service }}/coverage/lcov.info
          flags: ${{ matrix.service }}

  security-scan:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  build-and-push:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.event_name == 'push'
    strategy:
      matrix:
        service: [auth-api, cleaning-api, maintenance-api, customer-api, web-customer, web-maintenance, web-worker]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./apps/${{ matrix.service }}/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.ref == 'refs/heads/develop'
    environment: staging

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
        with:
          version: 'v1.28.0'

      - name: Configure kubectl
        run: |
          echo "${{ secrets.KUBE_CONFIG_STAGING }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig

      - name: Deploy to staging
        run: |
          export KUBECONFIG=kubeconfig
          helm upgrade --install rightfit-staging ./helm/rightfit \
            --namespace staging \
            --create-namespace \
            --set image.tag=${{ github.sha }} \
            --set environment=staging \
            --values ./helm/values-staging.yaml

      - name: Run smoke tests
        run: |
          export KUBECONFIG=kubeconfig
          kubectl wait --for=condition=ready pod -l app=rightfit-staging -n staging --timeout=300s
          npm run test:smoke -- --env=staging

  deploy-production:
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
        with:
          version: 'v1.28.0'

      - name: Configure kubectl
        run: |
          echo "${{ secrets.KUBE_CONFIG_PRODUCTION }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig

      - name: Deploy to production (Blue-Green)
        run: |
          export KUBECONFIG=kubeconfig

          # Deploy to green environment
          helm upgrade --install rightfit-green ./helm/rightfit \
            --namespace production \
            --set image.tag=${{ github.sha }} \
            --set environment=production \
            --set deployment.color=green \
            --values ./helm/values-production.yaml

          # Wait for green deployment to be ready
          kubectl wait --for=condition=ready pod -l app=rightfit-green -n production --timeout=600s

          # Run health checks
          npm run test:health -- --env=production

          # Switch traffic to green
          kubectl patch service rightfit-service -n production \
            -p '{"spec":{"selector":{"version":"green"}}}'

          # Wait and verify
          sleep 30
          npm run test:smoke -- --env=production

      - name: Cleanup old blue deployment
        run: |
          export KUBECONFIG=kubeconfig
          helm uninstall rightfit-blue -n production || true

  rollback:
    runs-on: ubuntu-latest
    if: failure() && github.ref == 'refs/heads/main'
    needs: deploy-production
    environment: production

    steps:
      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
        with:
          version: 'v1.28.0'

      - name: Configure kubectl
        run: |
          echo "${{ secrets.KUBE_CONFIG_PRODUCTION }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig

      - name: Rollback deployment
        run: |
          export KUBECONFIG=kubeconfig
          helm rollback rightfit-green -n production
          kubectl patch service rightfit-service -n production \
            -p '{"spec":{"selector":{"version":"blue"}}}'
```

### 2. Dockerfile Templates

#### Multi-Stage API Dockerfile
```dockerfile
# apps/api/Dockerfile.template
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run the application
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy the built application
COPY --from=builder /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Copy configuration files
COPY --chown=nodejs:nodejs config ./config

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

USER nodejs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
```

#### Multi-Stage Web App Dockerfile
```dockerfile
# apps/web/Dockerfile.template
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js application
RUN npm run build

# Production image, copy all the files and run the application
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 3. Kubernetes Configuration

#### Namespace and RBAC Setup
```yaml
# k8s/namespaces.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: development
  labels:
    name: development
    environment: dev

---
apiVersion: v1
kind: Namespace
metadata:
  name: staging
  labels:
    name: staging
    environment: staging

---
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    name: production
    environment: prod
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: rightfit-sa
  namespace: production

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: rightfit-role
  namespace: production
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps", "secrets"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: rightfit-rolebinding
  namespace: production
subjects:
- kind: ServiceAccount
  name: rightfit-sa
  namespace: production
roleRef:
  kind: Role
  name: rightfit-role
  apiGroup: rbac.authorization.k8s.io
```

#### ConfigMaps and Secrets
```yaml
# k8s/configmaps.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: rightfit-config
  namespace: production
data:
  NODE_ENV: "production"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
  DATABASE_URL: "postgresql://rightfit_user:password@postgres-service:5432/rightfit_prod"
  JWT_SECRET: "your-jwt-secret-key"
  API_GATEWAY_URL: "https://api.rightfit.com"
  SMTP_HOST: "smtp.gmail.com"
  SMTP_PORT: "587"

---
apiVersion: v1
kind: Secret
metadata:
  name: rightfit-secrets
  namespace: production
type: Opaque
data:
  DATABASE_PASSWORD: <base64-encoded-password>
  REDIS_PASSWORD: <base64-encoded-password>
  JWT_PRIVATE_KEY: <base64-encoded-private-key>
  STRIPE_SECRET_KEY: <base64-encoded-stripe-key>
  AWS_ACCESS_KEY_ID: <base64-encoded-aws-key>
  AWS_SECRET_ACCESS_KEY: <base64-encoded-aws-secret>
```

### 4. Helm Charts

#### Chart Structure
```
helm/
├── rightfit/
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── values-dev.yaml
│   ├── values-staging.yaml
│   ├── values-production.yaml
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── ingress.yaml
│       ├── configmap.yaml
│       ├── secret.yaml
│       ├── hpa.yaml
│       ├── pdb.yaml
│       └── serviceaccount.yaml
```

#### Chart.yaml
```yaml
# helm/rightfit/Chart.yaml
apiVersion: v2
name: rightfit
description: RightFit Services Platform
type: application
version: 0.1.0
appVersion: "1.0.0"

dependencies:
  - name: postgresql
    version: 12.x.x
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis
    version: 17.x.x
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled
  - name: ingress-nginx
    version: 4.x.x
    repository: https://kubernetes.github.io/ingress-nginx
    condition: ingress-nginx.enabled
```

#### Deployment Template
```yaml
# helm/rightfit/templates/deployment.yaml
{{- range $service := list "auth-api" "cleaning-api" "maintenance-api" "customer-api" }}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ $service }}
  namespace: {{ $.Release.Namespace }}
  labels:
    app: {{ $service }}
    version: {{ $.Values.deployment.color | default "blue" }}
    chart: {{ $.Chart.Name }}-{{ $.Chart.Version }}
    release: {{ $.Release.Name }}
    heritage: {{ $.Release.Service }}
spec:
  replicas: {{ $.Values.replicas }}
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0
  selector:
    matchLabels:
      app: {{ $service }}
      version: {{ $.Values.deployment.color | default "blue" }}
  template:
    metadata:
      labels:
        app: {{ $service }}
        version: {{ $.Values.deployment.color | default "blue" }}
        release: {{ $.Release.Name }}
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
        checksum/secret: {{ include (print $.Template.BasePath "/secret.yaml") . | sha256sum }}
    spec:
      serviceAccountName: {{ $.Values.serviceAccount.name }}
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: {{ $service }}
        image: "{{ $.Values.image.repository }}-{{ $service }}:{{ $.Values.image.tag }}"
        imagePullPolicy: {{ $.Values.image.pullPolicy }}
        ports:
        - name: http
          containerPort: {{ $.Values.service.port }}
          protocol: TCP
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: {{ $.Values.configMap.name }}
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: {{ $.Values.secret.name }}
              key: DATABASE_URL
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: {{ $.Values.secret.name }}
              key: REDIS_PASSWORD
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: {{ $.Values.secret.name }}
              key: JWT_SECRET
        resources:
          limits:
            cpu: {{ $.Values.resources.limits.cpu }}
            memory: {{ $.Values.resources.limits.memory }}
          requests:
            cpu: {{ $.Values.resources.requests.cpu }}
            memory: {{ $.Values.resources.requests.memory }}
        volumeMounts:
        - name: config
          mountPath: /app/config
          readOnly: true
        - name: logs
          mountPath: /app/logs
      volumes:
      - name: config
        configMap:
          name: {{ $.Values.configMap.name }}
      - name: logs
        emptyDir: {}
      terminationGracePeriodSeconds: 30
{{- end }}
```

#### Horizontal Pod Autoscaler
```yaml
# helm/rightfit/templates/hpa.yaml
{{- range $service := list "auth-api" "cleaning-api" "maintenance-api" "customer-api" }}
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ $service }}-hpa
  namespace: {{ $.Release.Namespace }}
  labels:
    app: {{ $service }}
    chart: {{ $.Chart.Name }}-{{ $.Chart.Version }}
    release: {{ $.Release.Name }}
    heritage: {{ $.Release.Service }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ $service }}
  minReplicas: {{ $.Values.hpa.minReplicas }}
  maxReplicas: {{ $.Values.hpa.maxReplicas }}
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: {{ $.Values.hpa.targetCPUUtilization }}
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: {{ $.Values.hpa.targetMemoryUtilization }}
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
{{- end }}
```

### 5. Environment Management

#### Terraform Configuration
```hcl
# terraform/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.10"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    vault = {
      source  = "hashicorp/vault"
      version = "~> 3.20"
    }
  }

  backend "s3" {
    bucket = "rightfit-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "us-west-2"
    encrypt = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.cluster.token
}

provider "helm" {
  kubernetes {
    host                   = data.aws_eks_cluster.cluster.endpoint
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.cluster.token
  }
}

# EKS Cluster
resource "aws_eks_cluster" "cluster" {
  name     = var.cluster_name
  role_arn = aws_iam_role.eks_cluster.arn
  version  = var.kubernetes_version

  vpc_config {
    subnet_ids = concat(
      aws_subnet.private[*].id,
      aws_subnet.public[*].id
    )
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = var.allowed_cidr_blocks
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
  ]

  tags = {
    Environment = var.environment
    Project     = "rightfit"
  }
}

# Node Groups
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.cluster.name
  node_group_name = "main"
  node_role_arn   = aws_iam_role.eks_nodes.arn
  subnet_ids      = aws_subnet.private[*].id

  scaling_config {
    desired_size = var.desired_capacity
    max_size     = var.max_capacity
    min_size     = var.min_capacity
  }

  instance_types = var.instance_types

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_policy,
  ]

  tags = {
    Environment = var.environment
    Project     = "rightfit"
  }
}

# Helm Release
resource "helm_release" "rightfit" {
  name       = "rightfit"
  namespace  = kubernetes_namespace.rightfit.metadata.0.name
  repository = "https://charts.rightfit.com"
  chart      = "rightfit"
  version    = var.chart_version

  values = [
    file("${path.module}/helm/values-${var.environment}.yaml")
  ]

  set {
    name  = "image.tag"
    value = var.image_tag
  }

  set {
    name  = "environment"
    value = var.environment
  }

  depends_on = [
    aws_eks_node_group.main,
    kubernetes_namespace.rightfit
  ]
}
```

#### Environment Variables
```hcl
# terraform/variables.tf
variable "environment" {
  description = "Environment name"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "rightfit-cluster"
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.28"
}

variable "instance_types" {
  description = "EC2 instance types for node group"
  type        = list(string)
  default     = ["t3.medium", "t3.large"]
}

variable "min_capacity" {
  description = "Minimum number of nodes"
  type        = number
  default     = 3
}

variable "max_capacity" {
  description = "Maximum number of nodes"
  type        = number
  default     = 10
}

variable "desired_capacity" {
  description = "Desired number of nodes"
  type        = number
  default     = 3
}

variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}

variable "chart_version" {
  description = "Helm chart version"
  type        = string
  default     = "0.1.0"
}
```

### 6. Monitoring and Alerting

#### Prometheus Configuration
```yaml
# monitoring/prometheus.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s

    rule_files:
      - "/etc/prometheus/rules/*.yml"

    alerting:
      alertmanagers:
        - static_configs:
            - targets:
              - alertmanager:9093

    scrape_configs:
      - job_name: 'kubernetes-apiservers'
        kubernetes_sd_configs:
          - role: endpoints
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
          - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
            action: keep
            regex: default;kubernetes;https

      - job_name: 'kubernetes-nodes'
        kubernetes_sd_configs:
          - role: node
        relabel_configs:
          - action: labelmap
            regex: __meta_kubernetes_node_label_(.+)
          - target_label: __address__
            replacement: kubernetes.default.svc:443
          - source_labels: [__meta_kubernetes_node_name]
            regex: (.+)
            target_label: __metrics_path__
            replacement: /api/v1/nodes/${1}/proxy/metrics

      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
          - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
            action: replace
            regex: ([^:]+)(?::\d+)?;(\d+)
            replacement: $1:$2
            target_label: __address__
          - action: labelmap
            regex: __meta_kubernetes_pod_label_(.+)
          - source_labels: [__meta_kubernetes_namespace]
            action: replace
            target_label: kubernetes_namespace
          - source_labels: [__meta_kubernetes_pod_name]
            action: replace
            target_label: kubernetes_pod_name

      - job_name: 'rightfit-services'
        kubernetes_sd_configs:
          - role: pod
          namespaces:
            names:
              - production
              - staging
              - development
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_label_app]
            action: keep
            regex: (auth-api|cleaning-api|maintenance-api|customer-api)
          - source_labels: [__meta_kubernetes_pod_ip]
            target_label: __address__
          - source_labels: [__meta_kubernetes_pod_label_app]
            target_label: service
          - source_labels: [__meta_kubernetes_pod_label_version]
            target_label: version
          - source_labels: [__meta_kubernetes_namespace]
            target_label: namespace

  alert_rules.yml: |
    groups:
      - name: rightfit.rules
        rules:
          - alert: HighErrorRate
            expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
            for: 5m
            labels:
              severity: critical
            annotations:
              summary: "High error rate detected"
              description: "Error rate is {{ $value }} errors per second"

          - alert: HighLatency
            expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "High latency detected"
              description: "95th percentile latency is {{ $value }} seconds"

          - alert: PodCrashLooping
            expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
            for: 5m
            labels:
              severity: critical
            annotations:
              summary: "Pod is crash looping"
              description: "Pod {{ $labels.pod }} in namespace {{ $labels.namespace }} is crash looping"

          - alert: HighMemoryUsage
            expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "High memory usage"
              description: "Memory usage is above 90%"

          - alert: HighCPUUsage
            expr: rate(container_cpu_usage_seconds_total[5m]) > 0.8
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "High CPU usage"
              description: "CPU usage is above 80%"
```

### 7. GitOps with ArgoCD

#### ArgoCD Application
```yaml
# argocd/rightfit-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: rightfit-production
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/rightfit/infrastructure.git
    targetRevision: HEAD
    path: helm/rightfit
    helm:
      valueFiles:
        - values-production.yaml
      parameters:
        - name: image.tag
          value: "v1.2.3"
        - name: environment
          value: "production"
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
  revisionHistoryLimit: 10
```

### 8. Secret Management with Vault

#### Vault Configuration
```yaml
# vault/vault-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: vault-config
  namespace: vault
data:
  vault.hcl: |
    ui = true

    listener "tcp" {
      address = "0.0.0.0:8200"
      tls_disable = 1
    }

    storage "consul" {
      address = "consul:8500"
      path = "vault/"
    }

    api_addr = "http://vault:8200"
    cluster_addr = "http://vault:8201"

    disable_mlock = true

    telemetry {
      prometheus_retention_time = "24h"
      disable_hostname = true
    }

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vault
  namespace: vault
spec:
  replicas: 1
  selector:
    matchLabels:
      app: vault
  template:
    metadata:
      labels:
        app: vault
    spec:
      containers:
      - name: vault
        image: vault:1.14.0
        ports:
        - containerPort: 8200
          name: vault
          protocol: TCP
        - containerPort: 8201
          name: cluster
          protocol: TCP
        env:
        - name: VAULT_ADDR
          value: "http://localhost:8200"
        - name: VAULT_LOCAL_CONFIG
          valueFrom:
            configMapKeyRef:
              name: vault-config
              key: vault.hcl
        - name: VAULT_TOKEN
          valueFrom:
            secretKeyRef:
              name: vault-token
              key: token
        command:
        - vault
        - server
        - -config=/vault/config/vault.hcl
        volumeMounts:
        - name: vault-config
          mountPath: /vault/config
        - name: vault-file
          mountPath: /vault/file
        securityContext:
          capabilities:
            add:
            - IPC_LOCK
      volumes:
      - name: vault-config
        configMap:
          name: vault-config
      - name: vault-file
        emptyDir: {}
```

### 9. Testing Strategies

#### Integration Tests
```typescript
# tests/integration/api-integration.test.ts
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

describe('API Integration Tests', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Setup auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@rightfit.com',
        password: 'testpassword123',
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication API', () => {
    it('POST /auth/login - should authenticate user', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@rightfit.com',
          password: 'testpassword123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.token).toBeDefined();
          expect(res.body.user.email).toBe('test@rightfit.com');
        });
    });

    it('GET /auth/profile - should return user profile', async () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('test@rightfit.com');
        });
    });
  });

  describe('Cleaning API', () => {
    it('GET /cleaning/jobs - should return jobs list', async () => {
      return request(app.getHttpServer())
        .get('/cleaning/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('POST /cleaning/jobs - should create new job', async () => {
      const jobData = {
        title: 'Office Cleaning',
        customerId: 'customer-123',
        location: {
          address: '123 Main St',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        startTime: new Date(Date.now() + 86400000).toISOString(),
        duration: '2 hours',
        price: 150
      };

      return request(app.getHttpServer())
        .post('/cleaning/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(jobData)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.title).toBe(jobData.title);
        });
    });
  });
});
```

#### E2E Tests
```typescript
# tests/e2e/user-journey.test.ts
import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('Customer books cleaning service', async ({ page }) => {
    // Navigate to customer portal
    await page.goto('https://customer.rightfit.com');

    // Login
    await page.fill('[data-testid="email"]', 'customer@test.com');
    await page.fill('[data-testid="password"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');

    // Navigate to services
    await page.click('[data-testid="services-link"]');
    await expect(page.locator('[data-testid="services-page"]')).toBeVisible();

    // Select cleaning service
    await page.click('[data-testid="cleaning-service"]');
    await page.fill('[data-testid="address"]', '123 Main St, City, State');
    await page.selectOption('[data-testid="service-type"]', 'office-cleaning');

    // Get quote
    await page.click('[data-testid="get-quote-button"]');
    await expect(page.locator('[data-testid="quote-result"]')).toBeVisible();

    // Book appointment
    await page.click('[data-testid="book-appointment"]');
    await page.click('[data-testid="select-date"]');
    await page.click('[data-testid="confirm-booking"]');

    // Verify booking confirmation
    await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
  });

  test('Worker manages job assignments', async ({ page }) => {
    // Navigate to worker app
    await page.goto('https://worker.rightfit.com');

    // Login as worker
    await page.fill('[data-testid="email"]', 'worker@test.com');
    await page.fill('[data-testid="password"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');

    // View dashboard
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="today-jobs"]')).toBeVisible();

    // Select a job
    await page.click('[data-testid="job-item"]');
    await expect(page.locator('[data-testid="job-details"]')).toBeVisible();

    // Start job
    await page.click('[data-testid="start-job"]');
    await expect(page.locator('[data-testid="job-in-progress"]')).toBeVisible();

    // Navigate to job location
    await page.click('[data-testid="navigate-button"]');
    // Note: In real test, you'd verify map opens

    // Complete job
    await page.click('[data-testid="complete-job"]');
    await page.fill('[data-testid="job-notes"]', 'Job completed successfully');
    await page.click('[data-testid="submit-completion"]');

    // Verify completion
    await expect(page.locator('[data-testid="job-completed"]')).toBeVisible();
  });
});
```

### 10. Deployment Scripts

#### Deploy Script
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

# Configuration
ENVIRONMENT=${1:-staging}
NAMESPACE=${ENVIRONMENT}
CHART_PATH="./helm/rightfit"
VALUES_FILE="values-${ENVIRONMENT}.yaml"
IMAGE_TAG=${2:-latest}

echo "Deploying RightFit to ${ENVIRONMENT} environment..."
echo "Image tag: ${IMAGE_TAG}"

# Validate environment
if [[ ! "${ENVIRONMENT}" =~ ^(development|staging|production)$ ]]; then
    echo "Error: Invalid environment. Must be one of: development, staging, production"
    exit 1
fi

# Check if kubectl is configured
if ! kubectl cluster-info &> /dev/null; then
    echo "Error: kubectl is not configured or cluster is not accessible"
    exit 1
fi

# Check if namespace exists
if ! kubectl get namespace ${NAMESPACE} &> /dev/null; then
    echo "Creating namespace: ${NAMESPACE}"
    kubectl create namespace ${NAMESPACE}
fi

# Add Helm repositories
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Deploy dependencies if needed
if [[ "${ENVIRONMENT}" == "development" ]]; then
    echo "Deploying dependencies for development environment..."
    helm upgrade --install postgresql bitnami/postgresql \
        --namespace ${NAMESPACE} \
        --set auth.postgresPassword=devpassword123 \
        --set auth.database=rightfit_dev

    helm upgrade --install redis bitnami/redis \
        --namespace ${NAMESPACE} \
        --set auth.password=redispassword123
fi

# Run pre-deployment checks
echo "Running pre-deployment checks..."

# Check if required secrets exist
if ! kubectl get secret rightfit-secrets -n ${NAMESPACE} &> /dev/null; then
    echo "Warning: rightfit-secrets secret not found in namespace ${NAMESPACE}"
    echo "Please create the secret before proceeding"
    exit 1
fi

# Validate Helm chart
echo "Validating Helm chart..."
helm lint ${CHART_PATH} --values ${CHART_PATH}/${VALUES_FILE}

# Dry run deployment
echo "Performing dry run..."
helm upgrade --install rightfit ${CHART_PATH} \
    --namespace ${NAMESPACE} \
    --values ${CHART_PATH}/${VALUES_FILE} \
    --set image.tag=${IMAGE_TAG} \
    --dry-run

# Deploy application
echo "Deploying application..."
helm upgrade --install rightfit ${CHART_PATH} \
    --namespace ${NAMESPACE} \
    --values ${CHART_PATH}/${VALUES_FILE} \
    --set image.tag=${IMAGE_TAG} \
    --wait \
    --timeout=10m

# Run post-deployment checks
echo "Running post-deployment checks..."

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=rightfit \
    -n ${NAMESPACE} --timeout=300s

# Check pod status
echo "Checking pod status..."
kubectl get pods -n ${NAMESPACE}

# Run health checks
echo "Running health checks..."

# Get load balancer URL if available
LOAD_BALANCER_URL=$(kubectl get ingress rightfit-ingress -n ${NAMESPACE} \
    -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")

if [[ -n "${LOAD_BALANCER_URL}" ]]; then
    echo "Load balancer URL: http://${LOAD_BALANCER_URL}"

    # Run health check
    if curl -f "http://${LOAD_BALANCER_URL}/health" &> /dev/null; then
        echo "✅ Health check passed"
    else
        echo "❌ Health check failed"
        exit 1
    fi
else
    echo "No load balancer URL available"
fi

# Run smoke tests
echo "Running smoke tests..."
if command -v npm &> /dev/null; then
    npm run test:smoke -- --env=${ENVIRONMENT}
else
    echo "npm not found, skipping smoke tests"
fi

echo "✅ Deployment completed successfully!"

# Show next steps
echo ""
echo "Next steps:"
echo "1. Verify the deployment at: http://${LOAD_BALANCER_URL:-localhost}"
echo "2. Check application logs: kubectl logs -n ${NAMESPACE} -l app.kubernetes.io/name=rightfit"
echo "3. Monitor the deployment: kubectl get pods -n ${NAMESPACE}"
echo "4. Run additional tests as needed"
```

This comprehensive CI/CD and deployment implementation provides enterprise-grade automation, reliability, and scalability for the RightFit Services platform with complete infrastructure as code and GitOps practices.