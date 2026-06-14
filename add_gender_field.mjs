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
    
    // Get current users collection schema
    console.log('\n📋 Fetching users collection schema...');
    const schemaResponse = await makeRequest('/api/collections/users', 'GET', null, token);
    
    if (schemaResponse.status !== 200) {
      console.error('Failed to fetch schema:', schemaResponse.data);
      return;
    }
    
    const currentFields = schemaResponse.data.fields || [];
    console.log('Current fields:', currentFields.map(f => f.name).join(', '));
    
    // Check if gender field already exists
    if (currentFields.find(f => f.name === 'gender')) {
      console.log('✅ Gender field already exists');
      return;
    }
    
    // Add gender field
    console.log('\n📝 Adding gender field...');
    const newField = {
      name: 'gender',
      type: 'text',
      required: false
    };
    
    const updatedFields = [...currentFields, newField];
    
    const updateResponse = await makeRequest('/api/collections/users', 'PATCH', {
      name: 'users',
      fields: updatedFields
    }, token);
    
    if (updateResponse.status === 200) {
      console.log('✅ Gender field added successfully!');
    } else {
      console.error('Failed to add gender field:', updateResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
