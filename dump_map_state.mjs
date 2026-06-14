import PocketBase from 'pocketbase';
const pb = new PocketBase('http://185.126.114.231.nip.io:8090');
async function dumpMapState() {
    try {
        const records = await pb.collection('map_state').getFullList();
        console.log("Full map_state records:", JSON.stringify(records, null, 2));
    } catch (e) {
        console.error("Error dumping records:", e);
    }
}
dumpMapState();
