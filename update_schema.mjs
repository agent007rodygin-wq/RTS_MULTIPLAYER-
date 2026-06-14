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
    
    // Update collection schema with all fields
    console.log('\n📝 Updating elections collection schema...');
    
    const updateData = {
      name: 'elections',
      type: 'base',
      fields: [
        // Keep existing id field
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
        { 
          "name": "candidates", 
          "type": "json", 
          "required": false
        },
        { 
          "name": "sheriffId", 
          "type": "text", 
          "required": false
        },
        { 
          "name": "sheriffName", 
          "type": "text", 
          "required": false
        },
        { 
          "name": "deputies", 
          "type": "json", 
          "required": false
        },
        { 
          "name": "electionEndTime", 
          "type": "number", 
          "required": false
        },
        { 
          "name": "firstElectionCompleted", 
          "type": "bool", 
          "required": false
        },
        { 
          "name": "kingId", 
          "type": "text", 
          "required": false
        },
        { 
          "name": "kingName", 
          "type": "text", 
          "required": false
        },
        { 
          "name": "queenId", 
          "type": "text", 
          "required": false
        },
        { 
          "name": "queenName", 
          "type": "text", 
          "required": false
        },
        { 
          "name": "votesTotal", 
          "type": "number", 
          "required": false
        },
        { 
          "name": "gameId", 
          "type": "text", 
          "required": false
        },
        { 
          "name": "data", 
          "type": "json", 
          "required": false
        },
      ],
    };
    
    const updateResponse = await makeRequest('/api/collections/elections', 'PATCH', updateData, token);
    console.log('Update schema status:', updateResponse.status);
    
    if (updateResponse.status === 200) {
      console.log('✅ Schema updated successfully!');
      console.log('Fields:', updateResponse.data.schema?.map(f => f.name).join(', '));
    } else {
      console.error('Failed to update schema:', updateResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
