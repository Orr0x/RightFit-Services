#!/bin/bash

# =====================================================
# RightFit Services: Database Separation Environment Setup
# =====================================================
# Version: 1.0
# Created: November 17, 2025
# Purpose: Set up separate database environments for cleaning and maintenance services
# Usage: ./database-setup.sh [dev|staging|prod]
# =====================================================

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${1:-dev}
POSTGRES_VERSION="15"
NETWORK_NAME="rightfit-network"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# Environment-specific configurations
case $ENVIRONMENT in
    "dev")
        SHARED_DB_PORT="5433"
        CLEANING_DB_PORT="5434"
        MAINTENANCE_DB_PORT="5435"
        CLEANING_DB_PASSWORD="cleaning_dev_password"
        MAINTENANCE_DB_PASSWORD="maintenance_dev_password"
        SHARED_DB_PASSWORD="shared_dev_password"
        ;;
    "staging")
        SHARED_DB_PORT="5433"
        CLEANING_DB_PORT="5434"
        MAINTENANCE_DB_PORT="5435"
        CLEANING_DB_PASSWORD="cleaning_staging_password"
        MAINTENANCE_DB_PASSWORD="maintenance_staging_password"
        SHARED_DB_PASSWORD="shared_staging_password"
        ;;
    "prod")
        SHARED_DB_PORT="5433"
        CLEANING_DB_PORT="5434"
        MAINTENANCE_DB_PORT="5435"
        CLEANING_DB_PASSWORD="${CLEANING_DB_PASSWORD:-$(openssl rand -base64 32)}"
        MAINTENANCE_DB_PASSWORD="${MAINTENANCE_DB_PASSWORD:-$(openssl rand -base64 32)}"
        SHARED_DB_PASSWORD="${SHARED_DB_PASSWORD:-$(openssl rand -base64 32)}"
        ;;
    *)
        log_error "Invalid environment. Usage: $0 [dev|staging|prod]"
        exit 1
        ;;
esac

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to create Docker network
create_network() {
    log "Creating Docker network: $NETWORK_NAME"
    if ! docker network ls | grep -q $NETWORK_NAME; then
        docker network create $NETWORK_NAME
        log_success "Docker network created successfully"
    else
        log_warning "Docker network already exists"
    fi
}

# Function to create database container
create_database() {
    local db_name=$1
    local db_port=$2
    local db_password=$3
    local db_user=$4

    log "Creating database container: $db_name"

    # Stop and remove existing container if it exists
    if docker ps -a | grep -q $db_name; then
        log_warning "Container $db_name already exists. Removing it..."
        docker stop $db_name
        docker rm $db_name
    fi

    # Create new container
    docker run -d \
        --name $db_name \
        --network $NETWORK_NAME \
        -e POSTGRES_DB=${db_name}_db \
        -e POSTGRES_USER=$db_user \
        -e POSTGRES_PASSWORD=$db_password \
        -e POSTGRES_INITDB_ARGS="--encoding=UTF-8 --lc-collate=en_US.UTF-8 --lc-ctype=en_US.UTF-8" \
        -p $db_port:5432 \
        -v "${db_name}_data:/var/lib/postgresql/data" \
        postgres:$POSTGRES_VERSION \
        -c max_connections=200 \
        -c shared_buffers=256MB \
        -c effective_cache_size=1GB \
        -c maintenance_work_mem=64MB \
        -c checkpoint_completion_target=0.9 \
        -c wal_buffers=16MB \
        -c default_statistics_target=100

    log_success "Database container $db_name created successfully"
}

# Function to wait for database to be ready
wait_for_database() {
    local db_name=$1
    local db_port=$2
    local db_user=$3
    local max_attempts=30
    local attempt=1

    log "Waiting for database $db_name to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if docker exec $db_name pg_isready -U $db_user -d ${db_name}_db; then
            log_success "Database $db_name is ready"
            return 0
        fi

        log "Attempt $attempt/$max_attempts: Database not ready yet..."
        sleep 2
        ((attempt++))
    done

    log_error "Database $db_name failed to start within $max_attempts attempts"
    exit 1
}

# Function to create database users and permissions
setup_database_users() {
    local db_name=$1
    local db_port=$2
    local db_user=$3
    local app_user=$4

    log "Setting up users for database: $db_name"

    # Create application user
    docker exec $db_name psql -U $db_user -d ${db_name}_db -c "
        CREATE USER $app_user WITH PASSWORD '${db_user}_app_password';
        GRANT CONNECT ON DATABASE ${db_name}_db TO $app_user;
        GRANT USAGE ON SCHEMA public TO $app_user;
        GRANT CREATE ON SCHEMA public TO $app_user;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $app_user;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $app_user;
    "

    log_success "Database users created for $db_name"
}

# Function to initialize database with extensions
initialize_database() {
    local db_name=$1
    local db_port=$2
    local db_user=$3

    log "Initializing database: $db_name with extensions"

    # Install required extensions
    docker exec $db_name psql -U $db_user -d ${db_name}_db -c "
        CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";
        CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";
        CREATE EXTENSION IF NOT EXISTS \"btree_gin\";
        CREATE EXTENSION IF NOT EXISTS \"btree_gist\";
        CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";
    "

    log_success "Database extensions installed for $db_name"
}

# Function to create backup scripts
create_backup_scripts() {
    local db_name=$1
    local db_port=$2
    local db_user=$3

    log "Creating backup scripts for $db_name"

    # Create backup directory
    mkdir -p "../backups/$ENVIRONMENT/$db_name"

    # Create backup script
    cat > "../backups/$ENVIRONMENT/$db_name/backup.sh" << EOF
#!/bin/bash
# Backup script for $db_name

BACKUP_DIR="../backups/$ENVIRONMENT/$db_name"
TIMESTAMP=\$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="\$BACKUP_DIR/${db_name}_backup_\$TIMESTAMP.sql"

# Create backup
docker exec $db_name pg_dump -U $db_user -d ${db_name}_db > "\$BACKUP_FILE"

# Compress backup
gzip "\$BACKUP_FILE"

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "${db_name}_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: \${BACKUP_FILE}.gz"
EOF

    chmod +x "../backups/$ENVIRONMENT/$db_name/backup.sh"
    log_success "Backup script created for $db_name"
}

# Function to create environment file
create_env_file() {
    local db_name=$1
    local db_port=$2
    local db_user=$3
    local db_password=$4

    log "Creating environment file for $db_name"

    cat > "../configs/${ENVIRONMENT}/${db_name}.env" << EOF
# Database Configuration for $db_name
DB_HOST=$db_name
DB_PORT=$db_port
DB_NAME=${db_name}_db
DB_USER=$db_user
DB_PASSWORD=$db_password
DB_SSL_MODE=disable
DB_POOL_MIN=2
DB_POOL_MAX=10

# Connection URL
DATABASE_URL="postgresql://$db_user:$db_password@localhost:$db_port/${db_name}_db?schema=public"

# App User Connection
APP_DATABASE_URL="postgresql://${db_user}_app:${db_user}_app_password@localhost:$db_port/${db_name}_db?schema=public"
EOF

    log_success "Environment file created for $db_name"
}

# Function to create monitoring setup
create_monitoring() {
    local db_name=$1

    log "Setting up monitoring for $db_name"

    # Create monitoring directory
    mkdir -p "../monitoring/$ENVIRONMENT/$db_name"

    # Create monitoring script
    cat > "../monitoring/$ENVIRONMENT/$db_name/monitor.sh" << EOF
#!/bin/bash
# Monitoring script for $db_name

# Check database connection
if docker exec $db_name pg_isready -U postgres -d ${db_name}_db > /dev/null 2>&1; then
    echo "Database $db_name is running"

    # Get database size
    SIZE=\$(docker exec $db_name psql -U postgres -d ${db_name}_db -t -c "
        SELECT pg_size_pretty(pg_database_size('${db_name}_db'));
    " | tr -d ' ')

    echo "Database size: \$SIZE"

    # Get connection count
    CONNECTIONS=\$(docker exec $db_name psql -U postgres -d ${db_name}_db -t -c "
        SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
    " | tr -d ' ')

    echo "Active connections: \$CONNECTIONS"

else
    echo "Database $db_name is not running"
    exit 1
fi
EOF

    chmod +x "../monitoring/$ENVIRONMENT/$db_name/monitor.sh"
    log_success "Monitoring script created for $db_name"
}

# Function to create health check
create_health_check() {
    log "Creating health check endpoint configuration"

    cat > "../configs/${ENVIRONMENT}/health-check.json" << EOF
{
  "shared_auth": {
    "host": "localhost",
    "port": $SHARED_DB_PORT,
    "database": "rightfit_shared_auth_db",
    "user": "shared_user"
  },
  "cleaning": {
    "host": "localhost",
    "port": $CLEANING_DB_PORT,
    "database": "rightfit_cleaning_db",
    "user": "cleaning_user"
  },
  "maintenance": {
    "host": "localhost",
    "port": $MAINTENANCE_DB_PORT,
    "database": "rightfit_maintenance_db",
    "user": "maintenance_user"
  }
}
EOF

    log_success "Health check configuration created"
}

# Main execution function
main() {
    log "Starting RightFit Services database separation setup for $ENVIRONMENT environment"

    # Pre-execution checks
    check_docker

    # Create directories
    mkdir -p "../configs/$ENVIRONMENT"
    mkdir -p "../backups/$ENVIRONMENT"
    mkdir -p "../logs/$ENVIRONMENT"

    # Create Docker network
    create_network

    # Create databases
    log "Creating shared authentication database..."
    create_database "rightfit-shared-auth" $SHARED_DB_PORT "$SHARED_DB_PASSWORD" "shared_user"

    log "Creating cleaning service database..."
    create_database "rightfit-cleaning" $CLEANING_DB_PORT "$CLEANING_DB_PASSWORD" "cleaning_user"

    log "Creating maintenance service database..."
    create_database "rightfit-maintenance" $MAINTENANCE_DB_PORT "$MAINTENANCE_DB_PASSWORD" "maintenance_user"

    # Wait for databases to be ready
    wait_for_database "rightfit-shared-auth" $SHARED_DB_PORT "shared_user"
    wait_for_database "rightfit-cleaning" $CLEANING_DB_PORT "cleaning_user"
    wait_for_database "rightfit-maintenance" $MAINTENANCE_DB_PORT "maintenance_user"

    # Setup databases
    setup_database_users "rightfit-shared-auth" $SHARED_DB_PORT "shared_user" "shared_app"
    setup_database_users "rightfit-cleaning" $CLEANING_DB_PORT "cleaning_user" "cleaning_app"
    setup_database_users "rightfit-maintenance" $MAINTENANCE_DB_PORT "maintenance_user" "maintenance_app"

    initialize_database "rightfit-shared-auth" $SHARED_DB_PORT "shared_user"
    initialize_database "rightfit-cleaning" $CLEANING_DB_PORT "cleaning_user"
    initialize_database "rightfit-maintenance" $MAINTENANCE_DB_PORT "maintenance_user"

    # Create supporting scripts and configurations
    create_backup_scripts "rightfit-shared-auth" $SHARED_DB_PORT "shared_user"
    create_backup_scripts "rightfit-cleaning" $CLEANING_DB_PORT "cleaning_user"
    create_backup_scripts "rightfit-maintenance" $MAINTENANCE_DB_PORT "maintenance_user"

    create_env_file "rightfit-shared-auth" $SHARED_DB_PORT "shared_user" "$SHARED_DB_PASSWORD"
    create_env_file "rightfit-cleaning" $CLEANING_DB_PORT "cleaning_user" "$CLEANING_DB_PASSWORD"
    create_env_file "rightfit-maintenance" $MAINTENANCE_DB_PORT "maintenance_user" "$MAINTENANCE_DB_PASSWORD"

    create_monitoring "rightfit-shared-auth"
    create_monitoring "rightfit-cleaning"
    create_monitoring "rightfit-maintenance"

    create_health_check

    # Create Docker Compose file for easy management
    log "Creating Docker Compose configuration..."
    cat > "../configs/${ENVIRONMENT}/docker-compose.yml" << EOF
version: '3.8'

services:
  rightfit-shared-auth:
    image: postgres:$POSTGRES_VERSION
    container_name: rightfit-shared-auth
    restart: unless-stopped
    networks:
      - rightfit-network
    environment:
      POSTGRES_DB: rightfit_shared_auth_db
      POSTGRES_USER: shared_user
      POSTGRES_PASSWORD: $SHARED_DB_PASSWORD
    ports:
      - "$SHARED_DB_PORT:5432"
    volumes:
      - shared_auth_data:/var/lib/postgresql/data
      - ../backups/$ENVIRONMENT/rightfit-shared-auth:/backups
    command: >
      postgres
      -c max_connections=200
      -c shared_buffers=256MB
      -c effective_cache_size=1GB
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100

  rightfit-cleaning:
    image: postgres:$POSTGRES_VERSION
    container_name: rightfit-cleaning
    restart: unless-stopped
    networks:
      - rightfit-network
    environment:
      POSTGRES_DB: rightfit_cleaning_db
      POSTGRES_USER: cleaning_user
      POSTGRES_PASSWORD: $CLEANING_DB_PASSWORD
    ports:
      - "$CLEANING_DB_PORT:5432"
    volumes:
      - cleaning_data:/var/lib/postgresql/data
      - ../backups/$ENVIRONMENT/rightfit-cleaning:/backups
    command: >
      postgres
      -c max_connections=200
      -c shared_buffers=256MB
      -c effective_cache_size=1GB
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100

  rightfit-maintenance:
    image: postgres:$POSTGRES_VERSION
    container_name: rightfit-maintenance
    restart: unless-stopped
    networks:
      - rightfit-network
    environment:
      POSTGRES_DB: rightfit_maintenance_db
      POSTGRES_USER: maintenance_user
      POSTGRES_PASSWORD: $MAINTENANCE_DB_PASSWORD
    ports:
      - "$MAINTENANCE_DB_PORT:5432"
    volumes:
      - maintenance_data:/var/lib/postgresql/data
      - ../backups/$ENVIRONMENT/rightfit-maintenance:/backups
    command: >
      postgres
      -c max_connections=200
      -c shared_buffers=256MB
      -c effective_cache_size=1GB
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100

networks:
  rightfit-network:
    external: true

volumes:
  shared_auth_data:
  cleaning_data:
  maintenance_data:
EOF

    # Success message
    log_success "Database separation setup completed successfully!"
    log ""
    log "Database Connection Information:"
    log "  Shared Auth Database: localhost:$SHARED_DB_PORT"
    log "  Cleaning Database: localhost:$CLEANING_DB_PORT"
    log "  Maintenance Database: localhost:$MAINTENANCE_DB_PORT"
    log ""
    log "Next Steps:"
    log "  1. Run database migration scripts: ./migration-scripts.sql"
    log "  2. Test database connections"
    log "  3. Update application configurations"
    log "  4. Start application services"
    log ""
    log "Management Commands:"
    log "  Start all databases: docker-compose -f ../configs/$ENVIRONMENT/docker-compose.yml up -d"
    log "  Stop all databases: docker-compose -f ../configs/$ENVIRONMENT/docker-compose.yml down"
    log "  View logs: docker-compose -f ../configs/$ENVIRONMENT/docker-compose.yml logs -f [service-name]"
    log ""
}

# Trap to handle cleanup on exit
trap 'log_error "Setup interrupted. Please check the error messages above."' INT TERM

# Execute main function
main "$@"