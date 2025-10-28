# Deployment Architecture

## Infrastructure Overview

```mermaid
graph TB
    subgraph "AWS eu-west-2 (London)"
        Route53["Route 53<br/>DNS"]

        subgraph "CDN Layer"
            CloudFront["CloudFront Distribution<br/>Static Assets + Photos"]
        end

        subgraph "Compute Layer"
            EC2["EC2 t3.small<br/>Docker<br/>Node.js API"]
        end

        subgraph "Data Layer"
            RDS["RDS PostgreSQL<br/>db.t3.micro<br/>Single-AZ (MVP)"]
            S3Photos["S3 Bucket<br/>rightfit-photos-prod"]
            S3Web["S3 Bucket<br/>rightfit-web-prod<br/>(Static Site)"]
        end

        subgraph "Secrets & Config"
            Secrets["Secrets Manager<br/>DB Credentials, API Keys"]
        end

        subgraph "Monitoring"
            CloudWatch["CloudWatch<br/>Logs + Alarms"]
            StatusPage["UptimeRobot<br/>Status Page"]
        end
    end

    subgraph "External Services"
        Stripe["Stripe"]
        Twilio["Twilio"]
        SendGrid["SendGrid"]
        GoogleVision["Google Vision API"]
        Sentry["Sentry"]
    end

    subgraph "App Stores"
        AppStore["Apple App Store<br/>(iOS)"]
        PlayStore["Google Play Store<br/>(Android)"]
    end

    Users["Users"] --> Route53
    Route53 --> CloudFront
    Route53 --> EC2
    CloudFront --> S3Web
    CloudFront --> S3Photos
    EC2 --> RDS
    EC2 --> S3Photos
    EC2 --> Secrets
    EC2 --> Stripe
    EC2 --> Twilio
    EC2 --> SendGrid
    EC2 --> GoogleVision
    EC2 --> CloudWatch
    EC2 --> Sentry
    StatusPage --> EC2

    MobileApps["Mobile Apps"] --> AppStore
    MobileApps --> PlayStore
    MobileApps --> EC2

    style EC2 fill:#50E3C2
    style RDS fill:#F5A623
    style S3Photos fill:#F5A623
    style CloudFront fill:#4A90E2
```

---

## MVP Deployment (Manual Setup)

### Phase 1: AWS Infrastructure Setup

#### 1. Create VPC (Optional - can use default VPC for MVP)

```bash
# Skip for MVP - use default VPC
# In production, create custom VPC with public/private subnets
```

#### 2. Launch RDS PostgreSQL

**AWS Console Steps:**
1. Navigate to RDS → Create database
2. **Engine**: PostgreSQL 14.10
3. **Template**: Free tier (for development) OR Dev/Test (for staging/production)
4. **Settings**:
   - DB instance identifier: `rightfit-services-prod`
   - Master username: `rightfit_admin`
   - Master password: (generate strong password, save to Secrets Manager)
5. **Instance configuration**: db.t3.micro (1 vCPU, 1GB RAM)
6. **Storage**: 20 GB gp3, autoscaling disabled for MVP
7. **Connectivity**:
   - VPC: Default VPC
   - Public access: No (only accessible from EC2)
   - Security group: Create new `rightfit-rds-sg` (allow PostgreSQL port 5432 from EC2 security group)
8. **Database authentication**: Password authentication
9. **Monitoring**: Enable Enhanced Monitoring (1 min granularity)
10. **Backup**: 7-day retention, automated backups

**Cost**: ~£15-20/month (Single-AZ)

#### 3. Create S3 Buckets

```bash
# Photos bucket
aws s3 mb s3://rightfit-services-photos-prod --region eu-west-2

# Enable versioning (for accidental delete protection)
aws s3api put-bucket-versioning \
  --bucket rightfit-services-photos-prod \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket rightfit-services-photos-prod \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Block public access (CloudFront will access via OAI)
aws s3api put-public-access-block \
  --bucket rightfit-services-photos-prod \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Web app bucket (for React web app static files)
aws s3 mb s3://rightfit-services-web-prod --region eu-west-2
aws s3 website s3://rightfit-services-web-prod --index-document index.html --error-document index.html
```

**Cost**: ~£0.023/GB/month (~£10-20/month at scale)

#### 4. Setup CloudFront Distribution

**AWS Console Steps:**
1. CloudFront → Create distribution
2. **Origin domain**: rightfit-services-photos-prod.s3.eu-west-2.amazonaws.com
3. **Origin access**: Origin Access Identity (OAI) - create new or select existing
4. **Viewer protocol policy**: Redirect HTTP to HTTPS
5. **Allowed HTTP methods**: GET, HEAD, OPTIONS
6. **Cache policy**: CachingOptimized
7. **Price class**: Use only North America and Europe (cost optimization)
8. **Alternate domain name (CNAME)**: cdn.rightfitservices.co.uk
9. **SSL certificate**: Request ACM certificate for `*.rightfitservices.co.uk`

Repeat for web app bucket (separate distribution).

**Cost**: Free tier 1TB/month, 10M requests. ~£0.085/GB + £0.012/10k requests after.

#### 5. Launch EC2 Instance

**AWS Console Steps:**
1. EC2 → Launch Instance
2. **Name**: rightfit-services-api-prod
3. **AMI**: Amazon Linux 2023 (or Ubuntu 22.04 LTS)
4. **Instance type**: t3.small (2 vCPU, 2GB RAM)
5. **Key pair**: Create new key pair (save `.pem` file securely)
6. **Network settings**:
   - VPC: Default VPC
   - Subnet: Public subnet (auto-assign public IP)
   - Security group: Create `rightfit-api-sg`
     - Allow SSH (port 22) from your IP only
     - Allow HTTP (port 80) from 0.0.0.0/0
     - Allow HTTPS (port 443) from 0.0.0.0/0
7. **Storage**: 30 GB gp3
8. **IAM role**: Create `rightfit-ec2-role` with policies:
   - `AmazonS3FullAccess` (for photo uploads)
   - `SecretsManagerReadWrite` (for reading DB credentials)
   - `CloudWatchAgentServerPolicy` (for logging)

**Cost**: ~£15/month (t3.small on-demand)

#### 6. Setup Secrets Manager

```bash
# Store database credentials
aws secretsmanager create-secret \
  --name rightfit-services/prod/database \
  --description "RDS PostgreSQL credentials" \
  --secret-string '{
    "host": "rightfit-services-prod.xxxxxx.eu-west-2.rds.amazonaws.com",
    "port": 5432,
    "database": "rightfit_prod",
    "username": "rightfit_admin",
    "password": "your-generated-password"
  }' \
  --region eu-west-2

# Store Stripe keys
aws secretsmanager create-secret \
  --name rightfit-services/prod/stripe \
  --secret-string '{
    "secret_key": "sk_live_...",
    "webhook_secret": "whsec_..."
  }' \
  --region eu-west-2

# Store other API keys (Twilio, SendGrid, Google Vision)
aws secretsmanager create-secret \
  --name rightfit-services/prod/api-keys \
  --secret-string '{
    "twilio_account_sid": "ACxxxxx",
    "twilio_auth_token": "xxxxx",
    "twilio_phone_number": "+441234567890",
    "sendgrid_api_key": "SG.xxxxx",
    "google_vision_api_key": "AIzaSyxxxx"
  }' \
  --region eu-west-2

# Store JWT secrets
aws secretsmanager create-secret \
  --name rightfit-services/prod/jwt \
  --secret-string '{
    "jwt_secret": "generate-long-random-string-here",
    "jwt_refresh_secret": "generate-different-long-random-string"
  }' \
  --region eu-west-2
```

**Cost**: ~£0.40/secret/month (~£2/month total)

---

## API Deployment (Docker on EC2)

### 1. Connect to EC2

```bash
ssh -i rightfit-services-prod.pem ec2-user@<EC2_PUBLIC_IP>
```

### 2. Install Docker

```bash
# Amazon Linux 2023
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 3. Clone Repository

```bash
# Install Git
sudo yum install -y git

# Clone repository (use deploy key for private repos)
git clone https://github.com/your-org/rightfit-services.git
cd rightfit-services

# Checkout production branch
git checkout main
```

### 4. Create Production Environment File

```bash
# apps/api/.env.production
cat > apps/api/.env.production <<'EOF'
NODE_ENV=production
PORT=3000

# Database (fetched from Secrets Manager at runtime)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/rightfit_prod

# JWT (fetched from Secrets Manager)
JWT_SECRET=xxx
JWT_REFRESH_SECRET=xxx
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# AWS
AWS_REGION=eu-west-2
S3_BUCKET_PHOTOS=rightfit-services-photos-prod
S3_BUCKET_CERTIFICATES=rightfit-services-certificates-prod
CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net

# External APIs (fetched from Secrets Manager)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+441234567890
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@rightfitservices.co.uk
GOOGLE_VISION_API_KEY=AIzaSyxxxx

# Firebase
FIREBASE_PROJECT_ID=rightfit-services
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@rightfit-services.iam.gserviceaccount.com

# CORS
ALLOWED_ORIGINS=https://app.rightfitservices.co.uk,https://www.rightfitservices.co.uk

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
```

### 5. Build and Run Docker Containers

```bash
# Build API Docker image
cd apps/api
docker build -t rightfit-api:latest -f Dockerfile .

# Run Prisma migrations
docker run --rm --env-file .env.production rightfit-api:latest npm run db:migrate

# Start API container
docker run -d \
  --name rightfit-api \
  --restart unless-stopped \
  --env-file .env.production \
  -p 3000:3000 \
  rightfit-api:latest

# Check logs
docker logs -f rightfit-api
```

### 6. Setup Nginx Reverse Proxy (for HTTPS)

```bash
# Install Nginx
sudo yum install -y nginx

# Configure Nginx
sudo tee /etc/nginx/conf.d/rightfit-api.conf > /dev/null <<'EOF'
server {
    listen 80;
    server_name api.rightfitservices.co.uk;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.rightfitservices.co.uk;

    # SSL certificates (from Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.rightfitservices.co.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.rightfitservices.co.uk/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy to Node.js API
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint (no auth)
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
EOF

# Install Certbot for Let's Encrypt SSL
sudo yum install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d api.rightfitservices.co.uk --email your-email@example.com --agree-tos --no-eff-email

# Auto-renewal (cron job)
echo "0 3 * * * certbot renew --quiet" | sudo crontab -

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Web App Deployment (S3 + CloudFront)

### 1. Build React Web App

```bash
# On local machine or CI/CD
cd apps/web

# Install dependencies
npm install

# Build for production
VITE_API_BASE_URL=https://api.rightfitservices.co.uk/api/v1 \
VITE_STRIPE_PUBLIC_KEY=pk_live_... \
npm run build

# Output in dist/
```

### 2. Deploy to S3

```bash
# Sync build to S3
aws s3 sync dist/ s3://rightfit-services-web-prod --delete

# Set cache headers for static assets
aws s3 cp s3://rightfit-services-web-prod s3://rightfit-services-web-prod \
  --recursive \
  --exclude "*" \
  --include "*.js" \
  --include "*.css" \
  --cache-control "max-age=31536000" \
  --metadata-directive REPLACE

# index.html should not be cached
aws s3 cp dist/index.html s3://rightfit-services-web-prod/index.html \
  --cache-control "no-cache" \
  --content-type "text/html"
```

### 3. Invalidate CloudFront Cache

```bash
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

---

## Mobile App Deployment (Expo EAS)

### 1. Configure EAS Build

```json
// apps/mobile/eas.json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "API_BASE_URL": "https://api-staging.rightfitservices.co.uk/api/v1"
      }
    },
    "production": {
      "env": {
        "API_BASE_URL": "https://api.rightfitservices.co.uk/api/v1"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 2. Build iOS App

```bash
cd apps/mobile

# Build for iOS (requires Apple Developer account)
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --latest
```

### 3. Build Android App

```bash
# Build for Android
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android --latest
```

---

## CI/CD with GitHub Actions

### API Deployment Workflow

```yaml
# .github/workflows/deploy-api.yml
name: Deploy API to EC2

on:
  push:
    branches: [main]
    paths:
      - 'apps/api/**'
      - 'packages/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test --filter=api

      - name: Build Docker image
        run: |
          cd apps/api
          docker build -t rightfit-api:${{ github.sha }} .

      - name: Push to AWS ECR
        run: |
          aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.eu-west-2.amazonaws.com
          docker tag rightfit-api:${{ github.sha }} ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.eu-west-2.amazonaws.com/rightfit-api:latest
          docker push ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.eu-west-2.amazonaws.com/rightfit-api:latest

      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ec2-user/rightfit-services
            git pull origin main
            docker pull ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.eu-west-2.amazonaws.com/rightfit-api:latest
            docker stop rightfit-api || true
            docker rm rightfit-api || true
            docker run -d --name rightfit-api --restart unless-stopped --env-file apps/api/.env.production -p 3000:3000 ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.eu-west-2.amazonaws.com/rightfit-api:latest
            docker system prune -f
```

---

## Monitoring & Alerts

### CloudWatch Alarms

```bash
# API CPU Utilization > 80%
aws cloudwatch put-metric-alarm \
  --alarm-name rightfit-api-high-cpu \
  --alarm-description "API CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --alarm-actions arn:aws:sns:eu-west-2:123456789012:rightfit-alerts

# RDS CPU > 80%
aws cloudwatch put-metric-alarm \
  --alarm-name rightfit-rds-high-cpu \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --dimensions Name=DBInstanceIdentifier,Value=rightfit-services-prod \
  --alarm-actions arn:aws:sns:eu-west-2:123456789012:rightfit-alerts
```

### UptimeRobot Setup

1. Sign up at uptimerobot.com (free plan)
2. Add monitor:
   - Type: HTTP(s)
   - URL: https://api.rightfitservices.co.uk/health
   - Interval: 5 minutes
   - Alert contacts: Your email, Slack webhook
3. Create status page: status.rightfitservices.co.uk

---

## Cost Summary (MVP)

| Service | Configuration | Monthly Cost (£) |
|---------|--------------|------------------|
| EC2 t3.small | 2 vCPU, 2GB RAM, 730 hrs/month | £15 |
| RDS db.t3.micro | 1GB RAM, 20GB storage, Single-AZ | £16 |
| S3 + CloudFront | 50GB storage, 500GB transfer | £15 |
| Secrets Manager | 5 secrets | £2 |
| Route 53 | 1 hosted zone | £0.50 |
| **Total** | | **~£48.50/month** |

**Scaling to 100 users (~£150-200/month):**
- EC2 t3.medium: £30
- RDS db.t3.small (Multi-AZ): £60
- S3 + CloudFront: £40
- ElastiCache Redis t3.micro: £12
- Other services: £10
- **Total: ~£152/month**

---

