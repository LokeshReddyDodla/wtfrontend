#!/bin/bash

# Script to create a test enrollment for the Weight Loss Agent
# Usage: ./scripts/create-enrollment.sh PATIENT_ID DOCTOR_ID

set -e

# Configuration
API_URL="${API_URL:-http://localhost:8000}"
PATIENT_ID="${1}"
DOCTOR_ID="${2:-00000000-0000-0000-0000-000000000000}"
TARGET_WEIGHT="${3:-70.0}"
TARGET_BMI="${4:-24.0}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Weight Loss Agent - Enrollment Creator      ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo ""

# Check if patient ID is provided
if [ -z "$PATIENT_ID" ]; then
    echo -e "${RED}Error: Patient ID is required${NC}"
    echo ""
    echo "Usage: $0 PATIENT_ID [DOCTOR_ID] [TARGET_WEIGHT] [TARGET_BMI]"
    echo ""
    echo "Example:"
    echo "  $0 a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    echo "  $0 a1b2c3d4-e5f6-7890-abcd-ef1234567890 doctor-id-here 65.0 23.0"
    echo ""
    exit 1
fi

echo -e "${BLUE}Configuration:${NC}"
echo -e "  API URL:       ${YELLOW}$API_URL${NC}"
echo -e "  Patient ID:    ${YELLOW}$PATIENT_ID${NC}"
echo -e "  Doctor ID:     ${YELLOW}$DOCTOR_ID${NC}"
echo -e "  Target Weight: ${YELLOW}$TARGET_WEIGHT kg${NC}"
echo -e "  Target BMI:    ${YELLOW}$TARGET_BMI${NC}"
echo ""

# Check if backend is running
echo -e "${BLUE}Checking backend connection...${NC}"
if ! curl -s -f "$API_URL/health" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to backend at $API_URL${NC}"
    echo -e "${YELLOW}Make sure aihealth-server is running${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend is running${NC}"
echo ""

# Create enrollment
echo -e "${BLUE}Creating enrollment...${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/weight-loss-agent/enroll" \
  -H "Content-Type: application/json" \
  -d "{
    \"patient_id\": \"$PATIENT_ID\",
    \"program_goals\": \"Lose weight and improve health through balanced diet and exercise\",
    \"target_weight_kg\": $TARGET_WEIGHT,
    \"target_bmi\": $TARGET_BMI,
    \"enrolled_by_care_provider_id\": \"$DOCTOR_ID\"
  }")

# Check if enrollment was successful
if echo "$RESPONSE" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✓ Enrollment created successfully!${NC}"
    echo ""
    
    # Extract enrollment ID
    ENROLLMENT_ID=$(echo "$RESPONSE" | grep -o '"enrollment_id":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$ENROLLMENT_ID" ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║              ENROLLMENT CREATED                ║${NC}"
        echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
        echo ""
        echo -e "${BLUE}Enrollment ID:${NC}"
        echo -e "${YELLOW}$ENROLLMENT_ID${NC}"
        echo ""
        echo -e "${BLUE}Next steps:${NC}"
        echo "1. Copy the enrollment ID above"
        echo "2. Edit .env.local:"
        echo -e "   ${YELLOW}VITE_ENROLLMENT_ID=$ENROLLMENT_ID${NC}"
        echo "3. Restart dev server:"
        echo -e "   ${YELLOW}npm run dev${NC}"
        echo ""
        
        # Update .env.local if it exists
        if [ -f ".env.local" ]; then
            if grep -q "VITE_ENROLLMENT_ID=" .env.local; then
                # Update existing line
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    sed -i '' "s/VITE_ENROLLMENT_ID=.*/VITE_ENROLLMENT_ID=$ENROLLMENT_ID/" .env.local
                else
                    sed -i "s/VITE_ENROLLMENT_ID=.*/VITE_ENROLLMENT_ID=$ENROLLMENT_ID/" .env.local
                fi
                echo -e "${GREEN}✓ Updated .env.local${NC}"
            else
                # Add new line
                echo "VITE_ENROLLMENT_ID=$ENROLLMENT_ID" >> .env.local
                echo -e "${GREEN}✓ Added to .env.local${NC}"
            fi
        else
            echo -e "${YELLOW}Note: .env.local not found. Create it manually.${NC}"
        fi
        echo ""
    fi
    
    # Show full response (optional)
    if [ "$VERBOSE" = "1" ]; then
        echo -e "${BLUE}Full Response:${NC}"
        echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    fi
else
    echo -e "${RED}✗ Failed to create enrollment${NC}"
    echo ""
    echo -e "${BLUE}Response:${NC}"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    echo ""
    exit 1
fi

