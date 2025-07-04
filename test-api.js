const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAPI() {
  console.log('🚀 Testing Checkout System API\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Endpoint');
    const health = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET'
    });
    console.log('   Status:', health.status);
    console.log('   Response:', JSON.stringify(health.data, null, 2));
    console.log('');

    // Test 2: Get Products
    console.log('2. Testing Get Products');
    const products = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/products',
      method: 'GET'
    });
    console.log('   Status:', products.status);
    console.log('   Products:', products.data.data?.length || 0, 'found');
    console.log('   Sample:', products.data.data?.[0] || 'None');
    console.log('');

    // Test 3: Create Cart
    console.log('3. Testing Create Cart');
    const cart = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/carts',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('   Status:', cart.status);
    console.log('   Cart ID:', cart.data.data?.id || 'Failed');
    
    const cartId = cart.data.data?.id;
    if (!cartId) {
      console.log('❌ Cannot continue without cart ID');
      return;
    }
    console.log('');

    // Test 4: Add Items to Cart
    console.log('4. Testing Add Items to Cart');
    
    // Add Item A
    const addA = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/carts/${cartId}/items`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { productId: 'A', quantity: 3 });
    console.log('   Add 3 A items:', addA.status === 200 ? '✅' : '❌');

    // Add Item B
    const addB = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/carts/${cartId}/items`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { productId: 'B', quantity: 2 });
    console.log('   Add 2 B items:', addB.status === 200 ? '✅' : '❌');

    // Add Item C
    const addC = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/carts/${cartId}/items`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { productId: 'C', quantity: 1 });
    console.log('   Add 1 C item:', addC.status === 200 ? '✅' : '❌');
    console.log('');

    // Test 5: Get Cart Summary
    console.log('5. Testing Cart Summary');
    const summary = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/carts/${cartId}/summary`,
      method: 'GET'
    });
    console.log('   Status:', summary.status);
    
    if (summary.data.data) {
      const data = summary.data.data;
      console.log('   Subtotal: Rs', data.subtotal);
      console.log('   Total Discount: Rs', data.totalDiscount);
      console.log('   Final Total: Rs', data.finalTotal);
      console.log('   Applied Discounts:', data.appliedDiscounts?.length || 0);
      
      console.log('\n   📊 Expected vs Actual:');
      console.log('   Expected Final Total: Rs 150 (3A=85 + 2B=35 + 1C=50 = 170, then -20 for >150 = 150)');
      console.log('   Actual Final Total: Rs', data.finalTotal);
      console.log('   Test Result:', data.finalTotal === 150 ? '✅ PASS' : '❌ FAIL');
    }

  } catch (error) {
    console.error('❌ API Test Error:', error.message);
  }
}

testAPI();
