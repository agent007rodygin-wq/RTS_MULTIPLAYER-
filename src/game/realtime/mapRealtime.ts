import { useEffect } from 'react';
import { db, doc, onSnapshot, FirebaseUser } from '../../pocketbase';

type LastForceReloadAtRef = { current: number };

interface UseMapForceReloadProps {
    isAuthReady: boolean;
    user: FirebaseUser | null | undefined;
    lastForceReloadAt: LastForceReloadAtRef;
}

export function useMapForceReload({ isAuthReady, user, lastForceReloadAt }: UseMapForceReloadProps) {
    useEffect(() => {
        if (!isAuthReady || !user) return;

        console.log("?? [SYSTEM] Global reload listener active. Version: 3.1.3");
        const mapStateRef = doc(db, 'map_state', 'status');
        let isInitialSnapshot = true;

        const unsubscribe = onSnapshot(mapStateRef, (docSnap) => {
            const data = docSnap.exists() ? docSnap.data() : null;
            const serverReloadTime = data?.forceReloadAt || 0;

            if (isInitialSnapshot) {
                console.log("?? [RELOAD] Initial sync. Current server reload time:", serverReloadTime);
                lastForceReloadAt.current = serverReloadTime;
                isInitialSnapshot = false;
                return;
            }

            // If we already had an initial sync, and now the time changed (or appeared from 0)
            if (serverReloadTime > lastForceReloadAt.current) {
                console.log(`?? [RELOAD] Signal detected: ${lastForceReloadAt.current} -> ${serverReloadTime}. Refreshing!`);
                lastForceReloadAt.current = serverReloadTime;
                window.location.reload();
            }
        });

        return () => unsubscribe();
    }, [isAuthReady, user]);
}
