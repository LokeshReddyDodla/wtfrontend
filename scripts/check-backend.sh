#!/bin/bash

# Script to check if backend is properly configured and running
# Usage: ./scripts/check-backend.sh [ENROLLMENT_ID]

set -e

API_URL="${API_URL:-http://localhost:8000}"
ENROLLMENT_ID="${1}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Backend Connection & Health Check         ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo ""

# Test 1: Check if backend is running
echo -e "${BLUE}[1/5] Checking if backend is running...${NC}"
if curl -s -f "$API_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running at $API_URL${NC}"
else
    echo -e "${RED}✗ Cannot connect to backend${NC}"
    echo -e "${YELLOW}Make sure aihealth-server is running on port 8000${NC}"
    exit 1
fi
echo ""

# Test 2: Check health endpoint
echo -e "${BLUE}[2/5] Checking health endpoint...${NC}"
HEALTH=$(curl -s "$API_URL/health" 2>/dev/null)
if echo "$HEALTH" | grep -q "status"; then
    echo -e "${GREEN}✓ Health endpoint responding${NC}"
    echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
else
    echo -e "${YELLOW}⚠ Health endpoint response unclear${NC}"
    echo "$HEALTH"
fi
echo ""

# Test 3: Check CORS headers
echo -e "${BLUE}[3/5] Checking CORS configuration...${NC}"
CORS_CHECK=$(curl -s -X OPTIONS "$API_URL/weight-loss-agent/enroll" \
    -H "Origin: http://localhost:5173" \
    -H "Access-Control-Request-Method: POST" \
    -I 2>/dev/null | grep -i "access-control")

if [ -n "$CORS_CHECK" ]; then
    echo -e "${GREEN}✓ CORS is configured${NC}"
    echo "$CORS_CHECK"
else
    echo -e "${YELLOW}⚠ CORS headers not found${NC}"
    echo -e "${YELLOW}This might cause issues with frontend${NC}"
fi
echo ""

# Test 4: Check if enrollment ID exists (if provided)
if [ -n "$ENROLLMENT_ID" ]; then
    echo -e "${BLUE}[4/5] Checking enrollment $ENROLLMENT_ID...${NC}"
    PROGRESS=$(curl -s "$API_URL/weight-loss-agent/enrollment/$ENROLLMENT_ID/progress" 2>/dev/null)
    
    if echo "$PROGRESS" | grep -q '"status":"success"'; then
        echo -e "${GREEN}✓ Enrollment found and accessible${NC}"
        
        # Extract some info
        PATIENT_ID=$(echo "$PROGRESS" | grep -o '"patient_id":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$PATIENT_ID" ]; then
            echo -e "  Patient ID: ${YELLOW}$PATIENT_ID${NC}"
        fi
    else
        echo -e "${RED}✗ Enrollment not found or error occurred${NC}"
        echo "$PROGRESS" | python3 -m json.tool 2>/dev/null || echo "$PROGRESS"
    fi
else
    echo -e "${BLUE}[4/5] Checking enrollment...${NC}"
    echo -e "${YELLOW}⊘ Skipped (no enrollment ID provided)${NC}"
    echo -e "${YELLOW}Run: $0 YOUR_ENROLLMENT_ID to test specific enrollment${NC}"
fi
echo ""

# Test 5: Check .env.local
echo -e "${BLUE}[5/5] Checking .env.local configuration...${NC}"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ .env.local exists${NC}"
    
    if grep -q "VITE_API_BASE_URL" .env.local; then
        API_URL_CONF=$(grep "VITE_API_BASE_URL" .env.local | cut -d'=' -f2)
        echo -e "  API URL: ${YELLOW}$API_URL_CONF${NC}"
    else
        echo -e "${YELLOW}  ⚠ VITE_API_BASE_URL not set${NC}"
    fi
    
    if grep -q "VITE_ENROLLMENT_ID" .env.local; then
        ENROLLMENT_CONF=$(grep "VITE_ENROLLMENT_ID" .env.local | cut -d'=' -f2)
        if [ -n "$ENROLLMENT_CONF" ]; then
            echo -e "  Enrollment ID: ${YELLOW}$ENROLLMENT_CONF${NC}"
        else
            echo -e "${YELLOW}  ⚠ VITE_ENROLLMENT_ID is empty${NC}"
        fi
    else
        echo -e "${YELLOW}  ⚠ VITE_ENROLLMENT_ID not set${NC}"
    fi
else
    echo -e "${RED}✗ .env.local not found${NC}"
    echo -e "${YELLOW}Create it using: cp .env.development .env.local${NC}"
fi
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Health Check Complete             ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"

