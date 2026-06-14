import PocketBase from 'pocketbase';

const pb = new PocketBase('http://185.126.114.231.nip.io:8090');

async function triggerReload() {
    console.log("🔄 Sending global reload signal to all players via PocketBase...");
    
    try {
        const pbId = 'status000000000'; 
        const now = Date.now();
        
        try {
            await pb.collection('map_state').update(pbId, {
                data: {
                    forceReloadAt: now,
                    generated: true
                }
            });
            console.log(`✅ Success! Updated forceReloadAt to ${now}.`);
        } catch (err) {
            await pb.collection('map_state').create({
                id: pbId,
                data: {
                    forceReloadAt: now,
                    generated: true
                }
            });
            console.log(`✅ Success! Created record with forceReloadAt ${now}.`);
        }
        
        console.log("🚀 Refresh signal sent! All players will refresh in ~1s.");
    } catch (e) {
        console.error("❌ Failed to send reload signal:", e);
        process.exit(1);
    } finally {
        // Clean up handles to avoid Windows async assertion error
        try {
            pb.authStore.clear();
            // Just let the process exit naturally by not having any more tasks
            console.log("Closing...");
        } catch(e) {}
        process.exit(0);
    }
}

triggerReload();
