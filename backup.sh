#!/bin/bash
#
# Database Backup Script for Folklovers
# Dumps PostgreSQL database and uploads to Scaleway S3
#
# Usage: ./backup.sh
#
# For systemd timer (Arch Linux), create:
#   /etc/systemd/system/folklovers-backup.service
#   /etc/systemd/system/folklovers-backup.timer
#
# See comments at the bottom of this file for systemd configuration examples.

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"
BACKUP_DIR="/tmp/folklovers-backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILENAME="folklovers_${TIMESTAMP}.sql.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Load environment variables from .env file
load_env() {
    if [[ ! -f "$ENV_FILE" ]]; then
        log_error "Environment file not found: $ENV_FILE"
        exit 1
    fi

    # Export variables from .env file (ignore comments and empty lines)
    set -a
    source <(grep -v '^#' "$ENV_FILE" | grep -v '^$')
    set +a

    log_info "Loaded environment from $ENV_FILE"
}

# Validate required environment variables
validate_env() {
    local required_vars=(
        "POSTGRES_USER"
        "POSTGRES_PASSWORD"
        "POSTGRES_DB"
        "S3_BACKUP_BUCKET"
        "S3_ENDPOINT"
        "S3_ACCESS_KEY"
        "S3_SECRET_KEY"
        "S3_REGION"
    )

    local missing=()
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing+=("$var")
        fi
    done

    if [[ ${#missing[@]} -gt 0 ]]; then
        log_error "Missing required environment variables: ${missing[*]}"
        exit 1
    fi

    log_info "Environment validation passed"
}

# Create backup directory
setup_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    log_info "Backup directory: $BACKUP_DIR"
}

# Dump PostgreSQL database
dump_database() {
    local backup_path="${BACKUP_DIR}/${BACKUP_FILENAME}"

    log_info "Starting database dump: ${POSTGRES_DB}"

    # Check if running in Docker context (production) or locally
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "folklovers.*db"; then
        # Production: dump via Docker
        local container_name
        container_name=$(docker ps --format '{{.Names}}' | grep "folklovers.*db" | head -1)

        log_info "Using Docker container: $container_name"

        docker exec "$container_name" pg_dump \
            -U "$POSTGRES_USER" \
            -d "$POSTGRES_DB" \
            --no-owner \
            --no-acl \
            | gzip > "$backup_path"
    else
        # Local/Direct: use pg_dump directly with connection string
        PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
            -h "${POSTGRES_HOST:-localhost}" \
            -U "$POSTGRES_USER" \
            -d "$POSTGRES_DB" \
            --no-owner \
            --no-acl \
            | gzip > "$backup_path"
    fi

    if [[ -f "$backup_path" ]] && [[ -s "$backup_path" ]]; then
        local size
        size=$(du -h "$backup_path" | cut -f1)
        log_info "Database dump completed: $backup_path ($size)"
        echo "$backup_path"
    else
        log_error "Database dump failed or empty"
        exit 1
    fi
}

# Upload backup to Scaleway S3
upload_to_s3() {
    local backup_path="$1"
    local s3_path="s3://${S3_BACKUP_BUCKET}/database/${BACKUP_FILENAME}"

    log_info "Uploading to S3: $s3_path"

    # Configure AWS CLI for Scaleway
    export AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY"
    export AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY"
    export AWS_DEFAULT_REGION="$S3_REGION"

    # Upload using AWS CLI with Scaleway endpoint
    aws s3 cp "$backup_path" "$s3_path" \
        --endpoint-url "$S3_ENDPOINT" \
        --storage-class STANDARD

    if [[ $? -eq 0 ]]; then
        log_info "Upload completed successfully"
    else
        log_error "Upload failed"
        exit 1
    fi
}

# Clean up old backups from S3 (retain last N days)
cleanup_old_backups() {
    log_info "Cleaning up backups older than ${RETENTION_DAYS} days"

    export AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY"
    export AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY"
    export AWS_DEFAULT_REGION="$S3_REGION"

    # List and delete old backups
    local cutoff_date
    cutoff_date=$(date -d "-${RETENTION_DAYS} days" +%Y%m%d 2>/dev/null || date -v-${RETENTION_DAYS}d +%Y%m%d)

    aws s3 ls "s3://${S3_BACKUP_BUCKET}/database/" \
        --endpoint-url "$S3_ENDPOINT" \
        | while read -r line; do
            local filename
            filename=$(echo "$line" | awk '{print $4}')

            # Extract date from filename (folklovers_YYYYMMDD_HHMMSS.sql.gz)
            local file_date
            file_date=$(echo "$filename" | grep -oP '(?<=folklovers_)\d{8}' || true)

            if [[ -n "$file_date" ]] && [[ "$file_date" < "$cutoff_date" ]]; then
                log_info "Deleting old backup: $filename"
                aws s3 rm "s3://${S3_BACKUP_BUCKET}/database/${filename}" \
                    --endpoint-url "$S3_ENDPOINT"
            fi
        done

    log_info "Cleanup completed"
}

# Clean up local temporary files
cleanup_local() {
    log_info "Cleaning up local temporary files"
    rm -rf "$BACKUP_DIR"
}

# Main execution
main() {
    log_info "=== Folklovers Database Backup Started ==="

    load_env
    validate_env
    setup_backup_dir

    local backup_path
    backup_path=$(dump_database)

    upload_to_s3 "$backup_path"
    cleanup_old_backups
    cleanup_local

    log_info "=== Backup Completed Successfully ==="
}

# Run main function
main "$@"

# =============================================================================
# SYSTEMD CONFIGURATION (Arch Linux)
# =============================================================================
#
# Create the service file:
# sudo nano /etc/systemd/system/folklovers-backup.service
#
# [Unit]
# Description=Folklovers Database Backup
# After=network-online.target docker.service
# Wants=network-online.target
#
# [Service]
# Type=oneshot
# User=root
# WorkingDirectory=/path/to/folklovers
# ExecStart=/path/to/folklovers/backup.sh
# StandardOutput=journal
# StandardError=journal
#
# [Install]
# WantedBy=multi-user.target
#
# -----------------------------------------------------------------------------
#
# Create the timer file:
# sudo nano /etc/systemd/system/folklovers-backup.timer
#
# [Unit]
# Description=Run Folklovers backup daily at 3 AM
#
# [Timer]
# OnCalendar=*-*-* 03:00:00
# Persistent=true
# RandomizedDelaySec=300
#
# [Install]
# WantedBy=timers.target
#
# -----------------------------------------------------------------------------
#
# Enable and start the timer:
# sudo systemctl daemon-reload
# sudo systemctl enable folklovers-backup.timer
# sudo systemctl start folklovers-backup.timer
#
# Check timer status:
# sudo systemctl list-timers folklovers-backup.timer
#
# Run manually:
# sudo systemctl start folklovers-backup.service
#
# View logs:
# journalctl -u folklovers-backup.service
# =============================================================================
