import PocketBase from 'pocketbase';

const pb = new PocketBase('http://185.126.114.231.nip.io:8090');

// Admin credentials
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASSWORD = 'BaSingSe2024';

async function createElectionsCollection() {
  try {
    // Authenticate as admin
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    
    console.log('Creating elections collection...');
    
    // Create the elections collection
    const collection = await pb.collections.create({
      name: 'elections',
      type: 'base',
      schema: [
        {
          name: 'candidates',
          type: 'json',
          required: false,
        },
        {
          name: 'sheriffId',
          type: 'text',
          required: false,
        },
        {
          name: 'sheriffName',
          type: 'text',
          required: false,
        },
        {
          name: 'deputies',
          type: 'json',
          required: false,
        },
        {
          name: 'electionEndTime',
          type: 'number',
          required: false,
        },
        {
          name: 'firstElectionCompleted',
          type: 'bool',
          required: false,
        },
        {
          name: 'kingId',
          type: 'text',
          required: false,
        },
        {
          name: 'kingName',
          type: 'text',
          required: false,
        },
        {
          name: 'queenId',
          type: 'text',
          required: false,
        },
        {
          name: 'queenName',
          type: 'text',
          required: false,
        },
        {
          name: 'votesTotal',
          type: 'number',
          required: false,
        },
        {
          name: 'gameId',
          type: 'text',
          required: false,
        },
        {
          name: 'data',
          type: 'json',
          required: false,
        },
      ],
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
    });
    
    console.log('✅ Elections collection created successfully!');
    console.log('Collection ID:', collection.id);
    
    // Create initial documents for police and royal elections
    const policeRecord = await pb.collection('elections').create({
      id: 'policezzzzzzzzz', // 15 chars
      candidates: {},
      sheriffId: null,
      sheriffName: null,
      deputies: [],
      electionEndTime: 0,
      firstElectionCompleted: false,
      gameId: 'police',
    });
    
    const royalRecord = await pb.collection('elections').create({
      id: 'royalzzzzzzzzzz', // 15 chars
      candidates: {},
      kingId: null,
      kingName: null,
      queenId: null,
      queenName: null,
      votesTotal: 0,
      electionEndTime: 0,
      gameId: 'royal',
    });
    
    console.log('✅ Initial election records created:');
    console.log('  - Police election ID:', policeRecord.id);
    console.log('  - Royal election ID:', royalRecord.id);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2));
    }
  }
}

// Check if admin credentials are provided
if (ADMIN_EMAIL === 'admin@example.com' || ADMIN_PASSWORD === 'your-password') {
  console.log('⚠️  Please edit this file and set your admin email and password:');
  console.log('   ADMIN_EMAIL = "your-admin-email"');
  console.log('   ADMIN_PASSWORD = "your-admin-password"');
  process.exit(1);
}

createElectionsCollection();
