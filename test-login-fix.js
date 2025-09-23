#!/usr/bin/env node

const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🧪 Probando login con las credenciales correctas...');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login exitoso!');
    console.log('📦 Respuesta:', JSON.stringify(response.data, null, 2));
    
    // Probar el endpoint /me con el token
    if (response.data.token) {
      console.log('\n🔍 Probando endpoint /me...');
      const meResponse = await axios.get('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      console.log('✅ Endpoint /me exitoso!');
      console.log('👤 Usuario:', meResponse.data.user.username);
    }
    
  } catch (error) {
    console.error('❌ Error en el login:');
    console.error('Mensaje:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
};

testLogin();
