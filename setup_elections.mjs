import PocketBase from 'pocketbase';

const PB_URL = 'http://185.126.114.231.nip.io:8090';
const pb = new PocketBase(PB_URL);

const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASSWORD = 'BaSingSe2024';

async function setupElections() {
  try {
    console.log('🔐 Authenticating to PocketBase at', PB_URL);
    console.log('Admin email:', ADMIN_EMAIL);
    
    // Try admin authentication
    try {
      await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
      console.log('✅ Authenticated as admin successfully!');
    } catch (authError) {
      console.error('❌ Admin authentication failed:', authError.message);
      console.log('\nTrying alternative approach...');
      
      // Try to check if we can at least connect to the server
      try {
        await pb.health.check();
        console.log('✅ PocketBase server is reachable');
      } catch (healthError) {
        console.error('❌ Cannot reach PocketBase server:', healthError.message);
        throw new Error('PocketBase server is not reachable at ' + PB_URL);
      }
      
      throw authError;
    }

    // Check if elections collection exists
    console.log('🔍 Checking if elections collection exists...');
    let collection;
    try {
      collection = await pb.collections.getOne('elections');
      console.log('✅ Elections collection already exists');
    } catch (e) {
      if (e.status === 404) {
        console.log('📝 Creating elections collection...');
        collection = await pb.collections.create({
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
        });
        console.log('✅ Elections collection created!');
      } else {
        throw e;
      }
    }

    // Check if police election record exists
    console.log('🔍 Checking police election record...');
    try {
      const policeRecord = await pb.collection('elections').getOne('policezzzzzzzzz');
      console.log('✅ Police election record exists:', policeRecord.id);
    } catch (e) {
      if (e.status === 404) {
        console.log('📝 Creating police election record...');
        await pb.collection('elections').create({
          id: 'policezzzzzzzzz',
          candidates: {},
          sheriffId: null,
          sheriffName: null,
          deputies: [],
          electionEndTime: 0,
          firstElectionCompleted: false,
          gameId: 'police',
        });
        console.log('✅ Police election record created!');
      }
    }

    // Check if royal election record exists
    console.log('🔍 Checking royal election record...');
    try {
      const royalRecord = await pb.collection('elections').getOne('royalzzzzzzzzzz');
      console.log('✅ Royal election record exists:', royalRecord.id);
    } catch (e) {
      if (e.status === 404) {
        console.log('📝 Creating royal election record...');
        await pb.collection('elections').create({
          id: 'royalzzzzzzzzzz',
          candidates: {},
          kingId: null,
          kingName: null,
          queenId: null,
          queenName: null,
          votesTotal: 0,
          electionEndTime: 0,
          gameId: 'royal',
        });
        console.log('✅ Royal election record created!');
      }
    }

    console.log('\n🎉 All done! Elections are now set up in PocketBase.');
    console.log('The election data will now persist after page refresh.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2));
    }
    process.exit(1);
  }
}

setupElections();
