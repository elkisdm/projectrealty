#!/usr/bin/env node

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function testWaitlist() {
  console.log('🧪 Testing Waitlist API...\n');

  // Test 1: Email válido
  console.log('1️⃣ Test: Email válido');
  try {
    const response = await fetch(`${BASE_URL}/api/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data)}`);
    console.log(`   ✅ ${response.status === 200 ? 'PASS' : 'FAIL'}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 2: Email inválido
  console.log('2️⃣ Test: Email inválido');
  try {
    const response = await fetch(`${BASE_URL}/api/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email' })
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data)}`);
    console.log(`   ✅ ${response.status === 400 ? 'PASS' : 'FAIL'}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 3: Rate limit (25 requests)
  console.log('3️⃣ Test: Rate limit (25 requests)');
  let rateLimited = false;
  
  for (let i = 0; i < 25; i++) {
    try {
      const response = await fetch(`${BASE_URL}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `test${i}@example.com` })
      });
      
      if (response.status === 429) {
        rateLimited = true;
        const data = await response.json();
        console.log(`   Rate limited at request ${i + 1}`);
        console.log(`   Response: ${JSON.stringify(data)}`);
        break;
      }
    } catch (error) {
      console.log(`   ❌ Error en request ${i + 1}: ${error.message}`);
      break;
    }
  }
  
  console.log(`   ✅ ${rateLimited ? 'PASS' : 'FAIL (no rate limit triggered)'}\n`);

  // Test 4: Email + phone
  console.log('4️⃣ Test: Email + phone');
  try {
    const response = await fetch(`${BASE_URL}/api/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'test+phone@example.com',
        phone: '+56912345678'
      })
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data)}`);
    console.log(`   ✅ ${response.status === 200 ? 'PASS' : 'FAIL'}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  console.log('🎯 Tests completados');
}

testWaitlist().catch(console.error);
