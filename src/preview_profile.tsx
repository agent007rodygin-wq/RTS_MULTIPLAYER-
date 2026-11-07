import React from 'react';
import ReactDOM from 'react-dom/client';
import { OtherPlayerProfileModal } from './components/game/OtherPlayerProfileModal';

const mockAllUsers = {
    'users42795': {
        uid: 'users42795',
        name: 'users42795',
        level: 1,
        glory: 558,
        reputation: 0,
        avatar: null,
        achievements: [],
        claimedAchievements: [],
        selectedTitle: null
    }
};

const mockStatusMeta = {
    isOnline: true,
    label: 'Онлайн',
    textClassName: 'text-emerald-400 font-bold',
    dotClassName: 'bg-emerald-400 shadow-[0_0_8px_#4ade80]'
};

const ProfilePreview = () => {
    return (
        <div id="qa-container" className="w-[596px] h-[760px] relative overflow-hidden flex items-center justify-center">
            <OtherPlayerProfileModal
                isOpen={true}
                selectedPlayerId="users42795"
                onClose={() => console.log('close')}
                allUsers={mockAllUsers}
                user={{ uid: 'other_user' }}
                playerLevel={1}
                playerGlory={558}
                playerReputation={0}
                playerGold={100000}
                playerRubies={50}
                playerName="users42795"
                sheriffId={null}
                deputies={[]}
                activeThieves={{}}
                selectedPlayerBuildings={[]}
                buildingData={[]}
                playerStatusMeta={mockStatusMeta}
                onPraisePlayer={(uid) => console.log('praise', uid)}
                onComplainPlayer={(uid) => console.log('complain', uid)}
                onVoteKing={(uid) => console.log('voteKing', uid)}
                onAddFriend={(uid) => console.log('addFriend', uid)}
                onOpenPrivateChat={(uid) => console.log('chat', uid)}
                onCatchCriminal={(uid) => console.log('criminal', uid)}
                onTeleportToBuilding={(x, y) => console.log('teleport', x, y)}
                onBanPlayer={(uid, cost, dur) => console.log('ban', uid, cost, dur)}
                onPunishPlayer={(uid, cost, pen, lbl) => console.log('punish', uid, cost, pen, lbl)}
                onCursePlayer={(uid, cost, dur, pre, lbl) => console.log('curse', uid, cost, dur, pre, lbl)}
            />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<ProfilePreview />);
