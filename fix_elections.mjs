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
    
    // Delete all existing election records
    console.log('\n🗑️ Deleting all existing election records...');
    const listResponse = await makeRequest('/api/collections/elections/records', 'GET', null, token);
    
    if (listResponse.status === 200) {
      for (const item of listResponse.data.items || []) {
        console.log(`Deleting record: ${item.id}`);
        await makeRequest(`/api/collections/elections/records/${item.id}`, 'DELETE', null, token);
      }
    }
    console.log('✅ All records deleted');
    
    // Delete and recreate collection with proper schema
    console.log('\n🗑️ Deleting elections collection...');
    const deleteColResponse = await makeRequest('/api/collections/elections', 'DELETE', null, token);
    console.log('Delete collection status:', deleteColResponse.status);
    
    // Create collection with proper schema
    console.log('\n📝 Creating elections collection with proper schema...');
    const collectionData = {
      name: 'elections',
      type: 'base',
      schema: [
        { name: 'candidates', type: 'json', required: false, options: {} },
        { name: 'sheriffId', type: 'text', required: false },
        { name: 'sheriffName', type: 'text', required: false },
        { name: 'deputies', type: 'json', required: false, options: {} },
        { name: 'electionEndTime', type: 'number', required: false },
        { name: 'firstElectionCompleted', type: 'bool', required: false },
        { name: 'kingId', type: 'text', required: false },
        { name: 'kingName', type: 'text', required: false },
        { name: 'queenId', type: 'text', required: false },
        { name: 'queenName', type: 'text', required: false },
        { name: 'votesTotal', type: 'number', required: false },
        { name: 'gameId', type: 'text', required: false },
        { name: 'data', type: 'json', required: false, options: {} },
      ],
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
    };
    
    const createResponse = await makeRequest('/api/collections', 'POST', collectionData, token);
    console.log('Create collection status:', createResponse.status);
    
    if (createResponse.status !== 200 && createResponse.status !== 201) {
      console.error('Failed to create collection:', createResponse.data);
      return;
    }
    
    console.log('✅ Collection created');
    
    // Create initial records using the correct IDs that sanitizePbId generates
    // 'police' -> sanitizePbId -> 'policezzzzzzzzz'
    // 'royal' -> sanitizePbId -> 'royalzzzzzzzzzz'
    
    console.log('\n📝 Creating police election record...');
    const policeData = {
      id: 'policezzzzzzzzz',
      candidates: {},
      electionEndTime: 0,
      firstElectionCompleted: false,
      gameId: 'police',
    };
    
    const policeResponse = await makeRequest('/api/collections/elections/records', 'POST', policeData, token);
    console.log('Police record status:', policeResponse.status);
    console.log('Police record response:', JSON.stringify(policeResponse.data, null, 2));
    if (policeResponse.status === 200 || policeResponse.status === 201) {
      console.log('✅ Police record created:', policeResponse.data.id);
    } else {
      console.error('Failed to create police record:', policeResponse.data);
    }
    
    console.log('\n📝 Creating royal election record...');
    const royalData = {
      id: 'royalzzzzzzzzzz',
      candidates: {},
      electionEndTime: 0,
      votesTotal: 0,
      gameId: 'royal',
    };
    
    const royalResponse = await makeRequest('/api/collections/elections/records', 'POST', royalData, token);
    console.log('Royal record status:', royalResponse.status);
    if (royalResponse.status === 200 || royalResponse.status === 201) {
      console.log('✅ Royal record created:', royalResponse.data.id);
    } else {
      console.error('Failed to create royal record:', royalResponse.data);
    }
    
    // Verify records
    console.log('\n📋 Verifying records...');
    const verifyResponse = await makeRequest('/api/collections/elections/records', 'GET', null, token);
    if (verifyResponse.status === 200) {
      console.log('Found', verifyResponse.data.items?.length || 0, 'records:');
      for (const item of verifyResponse.data.items || []) {
        console.log(`- ID: ${item.id}, gameId: ${item.gameId}, candidates:`, JSON.stringify(item.candidates));
      }
    }
    
    console.log('\n🎉 Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
