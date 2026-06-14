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
    
    // Get all records
    console.log('\n📋 Fetching all elections records...');
    const listResponse = await makeRequest('/api/collections/elections/records?perPage=100', 'GET', null, token);
    
    if (listResponse.status !== 200) {
      console.error('Failed to fetch records:', listResponse.data);
      return;
    }
    
    const records = listResponse.data.items || [];
    console.log(`Found ${records.length} records`);
    
    // Find the correct records (with data) and wrong records (empty)
    const policeCorrect = records.find(r => r.id === 'policezzzzzzzzz');
    const policeWrong = records.find(r => r.id === 'police000000000');
    const royalCorrect = records.find(r => r.id === 'royalzzzzzzzzzz');
    const royalWrong = records.find(r => r.id === 'royal0000000000');
    
    console.log('\n--- Analysis ---');
    console.log('policezzzzzzzzz (correct):', policeCorrect ? `exists, sheriff=${policeCorrect.sheriffId || 'none'}` : 'missing');
    console.log('police000000000 (wrong):', policeWrong ? `exists, sheriff=${policeWrong.sheriffId || 'none'}` : 'missing');
    console.log('royalzzzzzzzzzz (correct):', royalCorrect ? `exists, candidates=${JSON.stringify(royalCorrect.candidates)}` : 'missing');
    console.log('royal0000000000 (wrong):', royalWrong ? `exists, candidates=${JSON.stringify(royalWrong.candidates)}` : 'missing');
    
    // Copy data from wrong records to correct records
    if (policeWrong && policeWrong.sheriffId) {
      console.log('\n📝 Copying police data from wrong record to correct record...');
      await makeRequest('/api/collections/elections/records/policezzzzzzzzz', 'PATCH', {
        candidates: policeWrong.candidates,
        sheriffId: policeWrong.sheriffId,
        sheriffName: policeWrong.sheriffName,
        deputies: policeWrong.deputies,
        electionEndTime: policeWrong.electionEndTime,
        firstElectionCompleted: policeWrong.firstElectionCompleted,
      }, token);
      console.log('✅ Police data copied');
    }
    
    if (royalWrong && Object.keys(royalWrong.candidates || {}).length > 0) {
      console.log('\n📝 Copying royal data from wrong record to correct record...');
      await makeRequest('/api/collections/elections/records/royalzzzzzzzzzz', 'PATCH', {
        candidates: royalWrong.candidates,
        votesTotal: royalWrong.votesTotal,
        electionEndTime: royalWrong.electionEndTime,
        kingId: royalWrong.kingId,
        kingName: royalWrong.kingName,
        queenId: royalWrong.queenId,
        queenName: royalWrong.queenName,
      }, token);
      console.log('✅ Royal data copied');
    }
    
    // Delete wrong records
    console.log('\n🗑️ Deleting wrong records...');
    if (policeWrong) {
      console.log('Deleting police000000000...');
      await makeRequest('/api/collections/elections/records/police000000000', 'DELETE', null, token);
    }
    if (royalWrong) {
      console.log('Deleting royal0000000000...');
      await makeRequest('/api/collections/elections/records/royal0000000000', 'DELETE', null, token);
    }
    
    // Verify final state
    console.log('\n📋 Verifying final state...');
    const finalResponse = await makeRequest('/api/collections/elections/records?perPage=100', 'GET', null, token);
    if (finalResponse.status === 200) {
      console.log(`Found ${finalResponse.data.items?.length || 0} records:`);
      for (const item of finalResponse.data.items || []) {
        console.log(`- ${item.id}: gameId=${item.gameId}, candidates=${JSON.stringify(item.candidates).substring(0, 50)}`);
      }
    }
    
    console.log('\n🎉 Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
