// Explode ALL cannons - sets HP to 0 and triggers destruction
// Cannon IDs from all12.txt: 363-370, 382-385 + game code: 700, 701, 702, 801
const PB_URL = 'http://185.126.114.231:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

// All cannon building IDs (from all12.txt + game code)
const CANNON_BUILDING_IDS = [
  363, 364, 365, 366, 367, 368, 369, 370,  // Пушка 1-8
  382, 383, 384, 385,                      // Пушка 9-12
  700, 701, 702, 801                       // Game code cannons + towers
];

async function explodeAllCannons() {
  console.log('Authorizing...');
  const authRes = await fetch(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  const authData = await authRes.json();
  const token = authData.token;
  if (!token) { console.error('Auth failed'); return; }
  console.log('Authorized!');

  // Find all cannons
  const filterParts = CANNON_BUILDING_IDS.map(id => `buildingId=${id}`).join('||');
  const res = await fetch(PB_URL + `/api/collections/buildings/records?filter=(${filterParts})&perPage=500`, {
    headers: { Authorization: token }
  });
  const data = await res.json();
  const cannons = data.items || [];

  console.log(`Found ${cannons.length} cannons/towers to explode`);
  if (cannons.length === 0) return;

  // Show breakdown by type
  const byType = {};
  cannons.forEach(c => {
    byType[c.buildingId] = (byType[c.buildingId] || 0) + 1;
  });
  console.log('By type:', byType);

  let exploded = 0;
  for (const cannon of cannons) {
    try {
      // Set HP to 0 and mark as destroyed
      await fetch(PB_URL + `/api/collections/buildings/records/${cannon.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: token 
        },
        body: JSON.stringify({
          hp: 0,
          isDestroying: true,
          destructionTime: Date.now()
        })
      });
      exploded++;
      if (exploded % 10 === 0) console.log(`Exploded ${exploded}/${cannons.length}...`);
    } catch (err) {
      console.error(`Failed to explode cannon ${cannon.id}:`, err.message);
    }
  }

  console.log(`\nDone! ${exploded} cannons/towers exploded!`);
  console.log('They should now show destruction animation and disappear from the map.');
}

explodeAllCannons().catch(console.error);
