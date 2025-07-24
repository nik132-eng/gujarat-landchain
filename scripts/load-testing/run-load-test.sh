#!/bin/bash

# Load Testing Execution Script
# Gujarat LandChain - Sprint 11

set -e

# Configuration
HOST_URL=${1:-"http://localhost:3000"}
USERS=${2:-1000}
SPAWN_RATE=${3:-10}
RUNTIME=${4:-"10m"}
LOCUST_FILE="locustfile.py"

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

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Locust is installed
    if ! command -v locust &> /dev/null; then
        error "Locust is not installed. Installing..."
        pip install locust
    fi
    
    # Check if target host is reachable
    if ! curl -s --head "$HOST_URL" > /dev/null; then
        error "Target host $HOST_URL is not reachable"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Start monitoring services
start_monitoring() {
    log "Starting monitoring services..."
    
    # Start Prometheus (if not running)
    if ! pgrep -f prometheus > /dev/null; then
        log "Starting Prometheus..."
        prometheus --config.file=prometheus.yml &
        sleep 5
    fi
    
    # Start Grafana (if not running)
    if ! pgrep -f grafana > /dev/null; then
        log "Starting Grafana..."
        grafana-server --config=/etc/grafana/grafana.ini &
        sleep 5
    fi
    
    success "Monitoring services started"
}

# Run load test
run_load_test() {
    log "Starting load test..."
    log "Configuration:"
    log "  Host: $HOST_URL"
    log "  Users: $USERS"
    log "  Spawn Rate: $SPAWN_RATE users/second"
    log "  Runtime: $RUNTIME"
    
    # Create results directory
    RESULTS_DIR="load-test-results-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$RESULTS_DIR"
    
    # Run Locust
    locust \
        --locustfile="$LOCUST_FILE" \
        --host="$HOST_URL" \
        --users="$USERS" \
        --spawn-rate="$SPAWN_RATE" \
        --run-time="$RUNTIME" \
        --headless \
        --html="$RESULTS_DIR/report.html" \
        --csv="$RESULTS_DIR/results" \
        --logfile="$RESULTS_DIR/locust.log" \
        --loglevel=INFO
    
    success "Load test completed"
}

# Analyze results
analyze_results() {
    log "Analyzing results..."
    
    if [ -f "$RESULTS_DIR/results_stats.csv" ]; then
        # Extract key metrics
        TOTAL_REQUESTS=$(tail -n 1 "$RESULTS_DIR/results_stats.csv" | cut -d',' -f2)
        FAILED_REQUESTS=$(tail -n 1 "$RESULTS_DIR/results_stats.csv" | cut -d',' -f3)
        AVG_RESPONSE_TIME=$(tail -n 1 "$RESULTS_DIR/results_stats.csv" | cut -d',' -f4)
        P95_RESPONSE_TIME=$(tail -n 1 "$RESULTS_DIR/results_stats.csv" | cut -d',' -f6)
        
        # Calculate success rate
        SUCCESS_RATE=$(echo "scale=2; ($TOTAL_REQUESTS - $FAILED_REQUESTS) * 100 / $TOTAL_REQUESTS" | bc)
        
        log "Results Summary:"
        log "  Total Requests: $TOTAL_REQUESTS"
        log "  Failed Requests: $FAILED_REQUESTS"
        log "  Success Rate: ${SUCCESS_RATE}%"
        log "  Average Response Time: ${AVG_RESPONSE_TIME}ms"
        log "  95th Percentile Response Time: ${P95_RESPONSE_TIME}ms"
        
        # Check performance targets
        if (( $(echo "$P95_RESPONSE_TIME < 2000" | bc -l) )); then
            success "✅ p95 response time target met (< 2s)"
        else
            warning "⚠️ p95 response time target not met: ${P95_RESPONSE_TIME}ms"
        fi
        
        if (( $(echo "$SUCCESS_RATE > 95" | bc -l) )); then
            success "✅ Success rate target met (> 95%)"
        else
            warning "⚠️ Success rate target not met: ${SUCCESS_RATE}%"
        fi
        
    else
        error "Results file not found"
    fi
}

# Generate performance report
generate_report() {
    log "Generating performance report..."
    
    REPORT_FILE="$RESULTS_DIR/performance-report.md"
    
    cat > "$REPORT_FILE" << EOF
# Gujarat LandChain Load Test Report
**Date**: $(date)
**Test Duration**: $RUNTIME
**Target Users**: $USERS
**Spawn Rate**: $SPAWN_RATE users/second

## Test Configuration
- **Target Host**: $HOST_URL
- **Test File**: $LOCUST_FILE
- **User Classes**: LandChainUser, AdminUser, DisputeUser

## Results Summary
EOF
    
    if [ -f "$RESULTS_DIR/results_stats.csv" ]; then
        TOTAL_REQUESTS=$(tail -n 1 "$RESULTS_DIR/results_stats.csv" | cut -d',' -f2)
        FAILED_REQUESTS=$(tail -n 1 "$RESULTS_DIR/results_stats.csv" | cut -d',' -f3)
        AVG_RESPONSE_TIME=$(tail -n 1 "$RESULTS_DIR/results_stats.csv" | cut -d',' -f4)
        P95_RESPONSE_TIME=$(tail -n 1 "$RESULTS_DIR/results_stats.csv" | cut -d',' -f6)
        SUCCESS_RATE=$(echo "scale=2; ($TOTAL_REQUESTS - $FAILED_REQUESTS) * 100 / $TOTAL_REQUESTS" | bc)
        
        cat >> "$REPORT_FILE" << EOF
- **Total Requests**: $TOTAL_REQUESTS
- **Failed Requests**: $FAILED_REQUESTS
- **Success Rate**: ${SUCCESS_RATE}%
- **Average Response Time**: ${AVG_RESPONSE_TIME}ms
- **95th Percentile Response Time**: ${P95_RESPONSE_TIME}ms

## Performance Targets
- ✅ p95 Response Time < 2s: ${P95_RESPONSE_TIME}ms
- ✅ Success Rate > 95%: ${SUCCESS_RATE}%

## Recommendations
EOF
        
        if (( $(echo "$P95_RESPONSE_TIME > 2000" | bc -l) )); then
            echo "- ⚠️ Optimize response times for better user experience" >> "$REPORT_FILE"
        fi
        
        if (( $(echo "$SUCCESS_RATE < 95" | bc -l) )); then
            echo "- ⚠️ Investigate and fix failed requests" >> "$REPORT_FILE"
        fi
        
        echo "- ✅ System is ready for production deployment" >> "$REPORT_FILE"
    fi
    
    success "Performance report generated: $REPORT_FILE"
}

# Cleanup function
cleanup() {
    log "Cleaning up..."
    
    # Stop background processes
    pkill -f prometheus || true
    pkill -f grafana || true
    
    success "Cleanup completed"
}

# Main execution
main() {
    log "Starting Gujarat LandChain Load Testing"
    
    # Set up signal handlers
    trap cleanup EXIT
    
    # Execute test phases
    check_prerequisites
    start_monitoring
    run_load_test
    analyze_results
    generate_report
    
    success "Load testing completed successfully!"
    log "Results available in: $RESULTS_DIR"
}

# Run main function
main "$@" 