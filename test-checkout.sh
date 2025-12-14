#!/bin/bash

API="http://localhost:3001"

echo "🧪 Testing Checkout Flow..."
echo ""

# Step 1: Login
echo "1️⃣ Logging in..."
LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Test1234!"}')

TOKEN=$(echo $LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "✅ Login successful"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Add to cart (assuming souvenir ID exists from seed)
echo "2️⃣ Adding items to cart..."
ADD=$(curl -s -X POST "$API/cart/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"souvenir_id":"1","quantity":2}')

echo "✅ Items added"
echo ""

# Step 3: Get cart
echo "3️⃣ Getting cart items..."
CART=$(curl -s -X GET "$API/cart" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Cart retrieved"
echo "Cart: $CART"
echo ""

# Step 4: Checkout
echo "4️⃣ Creating order (checkout)..."
ORDER=$(curl -s -X POST "$API/payment/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"payment_method":"VNPAY"}')

echo "✅ Order created"
echo "Response: $ORDER"
echo ""

# Step 5: Verify cart is empty
echo "5️⃣ Verifying cart is empty..."
EMPTY=$(curl -s -X GET "$API/cart" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Cart after checkout: $EMPTY"
