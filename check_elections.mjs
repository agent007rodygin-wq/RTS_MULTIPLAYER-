import http from 'http';

const PB_HOST = '185.126.114.231';
const PB_PORT = '8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASSWORD = 'BaSingSe2024';

function makeRequest(path, method, data = null, authToken = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: PB_HOST,
      port: PB_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (authToken) {
      options.headers['Authorization'] = authToken;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
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

async function main() {
  try {
    console.log('🔐 Authenticating...');
    const authResponse = await makeRequest('/api/collections/_superusers/auth-with-password', 'POST', {
      identity: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (authResponse.status !== 200) {
      console.error('Auth failed:', authResponse.data);
      return;
    }
    
    const token = authResponse.data.token;
    console.log('✅ Authenticated!');
    
    // Get all elections records
    console.log('\n📋 Fetching all elections records...');
    const listResponse = await makeRequest('/api/collections/elections/records', 'GET', null, token);
    
    if (listResponse.status === 200) {
      console.log('Found', listResponse.data.items?.length || 0, 'records:');
      for (const item of listResponse.data.items || []) {
        console.log('\n--- Record ---');
        console.log('ID:', item.id);
        console.log('gameId:', item.gameId);
        console.log('candidates:', JSON.stringify(item.candidates));
        console.log('electionEndTime:', item.electionEndTime);
        console.log('sheriffId:', item.sheriffId);
        console.log('Full data:', JSON.stringify(item, null, 2));
      }
    } else {
      console.error('Failed to fetch:', listResponse.status, listResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
