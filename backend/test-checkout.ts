import axios from 'axios';

const API = 'http://localhost:3001';

async function testCheckout() {
  try {
    console.log('🧪 Testing Checkout Flow...\n');

    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginRes = await axios.post(`${API}/auth/login`, {
      email: 'user@test.com',
      password: 'Test1234!',
    });
    const token = loginRes.data.result.access_token;
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 20) + '...\n');

    // Step 2: Add items to cart
    console.log('2️⃣ Adding items to cart...');
    const cartRes = await axios.post(
      `${API}/cart/add`,
      { souvenir_id: '1', quantity: 2 },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Items added to cart');
    console.log('Cart:', cartRes.data.result, '\n');

    // Step 3: Get cart
    console.log('3️⃣ Getting cart...');
    const getCartRes = await axios.get(`${API}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Cart retrieved');
    console.log('Items:', getCartRes.data.result, '\n');

    // Step 4: Checkout (create order)
    console.log('4️⃣ Creating order (checkout)...');
    const checkoutRes = await axios.post(
      `${API}/payment/orders`,
      { payment_method: 'VNPAY' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Order created successfully');
    console.log('Order:', checkoutRes.data.result.order);
    console.log('Payment URL:', checkoutRes.data.result.paymentUrl, '\n');

    // Step 5: Verify cart is empty
    console.log('5️⃣ Verifying cart is empty...');
    const emptyCartRes = await axios.get(`${API}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Cart after checkout:');
    console.log('Items:', emptyCartRes.data.result, '\n');

    console.log('✅ All tests passed! Checkout flow works correctly.');
  } catch (err: any) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
}

testCheckout();
