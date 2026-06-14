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
    if (data) req.write(JSON.stringify(data));
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
    
    // First ensure schema is correct
    console.log('\n📝 Ensuring elections collection has correct schema...');
    const updateData = {
      name: 'elections',
      type: 'base',
      fields: [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        { "name": "candidates", "type": "json", "required": false },
        { "name": "sheriffId", "type": "text", "required": false },
        { "name": "sheriffName", "type": "text", "required": false },
        { "name": "deputies", "type": "json", "required": false },
        { "name": "electionEndTime", "type": "number", "required": false },
        { "name": "firstElectionCompleted", "type": "bool", "required": false },
        { "name": "kingId", "type": "text", "required": false },
        { "name": "kingName", "type": "text", "required": false },
        { "name": "queenId", "type": "text", "required": false },
        { "name": "queenName", "type": "text", "required": false },
        { "name": "votesTotal", "type": "number", "required": false },
        { "name": "gameId", "type": "text", "required": false },
        { "name": "data", "type": "json", "required": false },
      ],
    };
    
    await makeRequest('/api/collections/elections', 'PATCH', updateData, token);
    console.log('✅ Schema updated');
    
    // Delete all existing records
    console.log('\n🗑️ Deleting old records...');
    const listResponse = await makeRequest('/api/collections/elections/records?perPage=100', 'GET', null, token);
    
    if (listResponse.status === 200) {
      for (const item of listResponse.data.items || []) {
        console.log(`Deleting: ${item.id}`);
        await makeRequest(`/api/collections/elections/records/${item.id}`, 'DELETE', null, token);
      }
    }
    
    // Create new records with correct data
    console.log('\n📝 Creating police election record...');
    const policeData = {
      id: 'policezzzzzzzzz',
      candidates: {},
      sheriffId: '',
      sheriffName: '',
      deputies: [],
      electionEndTime: 0,
      firstElectionCompleted: false,
      gameId: 'police',
    };
    
    const policeResponse = await makeRequest('/api/collections/elections/records', 'POST', policeData, token);
    console.log('Status:', policeResponse.status);
    console.log('Response:', JSON.stringify(policeResponse.data, null, 2));
    
    console.log('\n📝 Creating royal election record...');
    const royalData = {
      id: 'royalzzzzzzzzzz',
      candidates: {},
      kingId: '',
      kingName: '',
      queenId: '',
      queenName: '',
      votesTotal: 0,
      electionEndTime: 0,
      gameId: 'royal',
    };
    
    const royalResponse = await makeRequest('/api/collections/elections/records', 'POST', royalData, token);
    console.log('Status:', royalResponse.status);
    console.log('Response:', JSON.stringify(royalResponse.data, null, 2));
    
    // Verify
    console.log('\n📋 Verifying records...');
    const verifyResponse = await makeRequest('/api/collections/elections/records?perPage=100', 'GET', null, token);
    if (verifyResponse.status === 200) {
      console.log('Found', verifyResponse.data.items?.length || 0, 'records:');
      for (const item of verifyResponse.data.items || []) {
        console.log(`\n- ID: ${item.id}`);
        console.log(`  gameId: ${item.gameId}`);
        console.log(`  candidates: ${JSON.stringify(item.candidates)}`);
        console.log(`  electionEndTime: ${item.electionEndTime}`);
      }
    }
    
    console.log('\n🎉 Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
