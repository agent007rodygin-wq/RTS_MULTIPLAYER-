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
    
    // Authenticate as admin
    const authResponse = await makeRequest('/api/admins/auth-with-password', 'POST', {
      identity: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    console.log('Auth response status:', authResponse.status);
    
    let token;
    
    if (authResponse.status !== 200) {
      console.error('Auth failed:', authResponse.data);
      
      // Try alternative endpoint
      console.log('\nTrying alternative auth endpoint...');
      const altAuth = await makeRequest('/api/collections/_superusers/auth-with-password', 'POST', {
        identity: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });
      console.log('Alt auth status:', altAuth.status);
      
      if (altAuth.status !== 200) {
        console.error('Alternative auth also failed:', altAuth.data);
        return;
      }
      
      token = altAuth.data.token;
    } else {
      token = authResponse.data.token;
    }
    console.log('✅ Authenticated! Token received.');
    
    // Create elections collection
    console.log('\n📝 Creating elections collection...');
    const collectionData = {
      name: 'elections',
      type: 'base',
      schema: [
        { name: 'candidates', type: 'json', required: false },
        { name: 'sheriffId', type: 'text', required: false },
        { name: 'sheriffName', type: 'text', required: false },
        { name: 'deputies', type: 'json', required: false },
        { name: 'electionEndTime', type: 'number', required: false },
        { name: 'firstElectionCompleted', type: 'bool', required: false },
        { name: 'kingId', type: 'text', required: false },
        { name: 'kingName', type: 'text', required: false },
        { name: 'queenId', type: 'text', required: false },
        { name: 'queenName', type: 'text', required: false },
        { name: 'votesTotal', type: 'number', required: false },
        { name: 'gameId', type: 'text', required: false },
        { name: 'data', type: 'json', required: false },
      ],
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
    };
    
    const createResponse = await makeRequest('/api/collections', 'POST', collectionData, token);
    console.log('Create collection status:', createResponse.status);
    
    if (createResponse.status === 200 || createResponse.status === 201) {
      console.log('✅ Elections collection created!');
    } else if (createResponse.status === 400 && createResponse.data?.message?.includes('already exists')) {
      console.log('ℹ️ Collection already exists');
    } else {
      console.error('Failed to create collection:', createResponse.data);
    }
    
    // Create initial records
    console.log('\n📝 Creating initial election records...');
    
    // Police election
    const policeData = {
      id: 'policezzzzzzzzz',
      candidates: {},
      sheriffId: null,
      sheriffName: null,
      deputies: [],
      electionEndTime: 0,
      firstElectionCompleted: false,
      gameId: 'police',
    };
    
    const policeResponse = await makeRequest('/api/collections/elections/records', 'POST', policeData, token);
    console.log('Police record status:', policeResponse.status);
    if (policeResponse.status === 200 || policeResponse.status === 201) {
      console.log('✅ Police election record created!');
    } else if (policeResponse.status === 400) {
      console.log('ℹ️ Police record may already exist');
    }
    
    // Royal election
    const royalData = {
      id: 'royalzzzzzzzzzz',
      candidates: {},
      kingId: null,
      kingName: null,
      queenId: null,
      queenName: null,
      votesTotal: 0,
      electionEndTime: 0,
      gameId: 'royal',
    };
    
    const royalResponse = await makeRequest('/api/collections/elections/records', 'POST', royalData, token);
    console.log('Royal record status:', royalResponse.status);
    if (royalResponse.status === 200 || royalResponse.status === 201) {
      console.log('✅ Royal election record created!');
    } else if (royalResponse.status === 400) {
      console.log('ℹ️ Royal record may already exist');
    }
    
    console.log('\n🎉 Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
