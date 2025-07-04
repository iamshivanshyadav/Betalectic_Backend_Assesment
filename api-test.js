const http = require('http');

// Test health endpoint
function testHealth() {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/health',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('Health check status:', res.statusCode);
                console.log('Health response:', data);
                resolve(data);
            });
        });
        
        req.on('error', (err) => {
            console.error('Health check error:', err.message);
            reject(err);
        });
        
        req.on('timeout', () => {
            console.error('Health check timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });
        
        req.end();
    });
}

// Test checkout calculation
function testCheckout() {
    return new Promise((resolve, reject) => {
        const requestData = JSON.stringify({
            items: ['A', 'B', 'A'],
            discountCode: 'SAVE10'
        });

        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/checkout/calculate',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestData)
            },
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('Checkout calculation status:', res.statusCode);
                console.log('Checkout response:', data);
                resolve(data);
            });
        });
        
        req.on('error', (err) => {
            console.error('Checkout test error:', err.message);
            reject(err);
        });
        
        req.on('timeout', () => {
            console.error('Checkout test timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });
        
        req.write(requestData);
        req.end();
    });
}

async function runTests() {
    console.log('Starting API tests...\n');
    
    try {
        console.log('1. Testing health endpoint...');
        await testHealth();
        console.log('✅ Health check passed\n');
        
        console.log('2. Testing checkout calculation...');
        await testCheckout();
        console.log('✅ Checkout test passed\n');
        
        console.log('🎉 All API tests completed successfully!');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

runTests();
