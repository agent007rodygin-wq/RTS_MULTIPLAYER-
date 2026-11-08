import React, { useState, memo } from 'react';
import { CompassIcon } from '../../../components/IconComponents';
import { BAN_OPTIONS, PUNISHMENT_OPTIONS, CURSE_OPTIONS } from '../../game/ui/actionOptions';
import { AchievementsView } from './AchievementsView';
import type { Building, PlacedBuilding } from '../../../types';

export interface PlayerStatusMeta {
    isOnline: boolean;
    label: string;
    textClassName: string;
    dotClassName: string;
}

export interface OtherPlayerProfileModalProps {
    isOpen: boolean;
    selectedPlayerId: string | null;
    onClose: () => void;
    allUsers: Record<string, any>;
    user: { uid: string } | null;
    playerLevel: number;
    playerGlory: number;
    playerReputation: number;
    playerGold: number;
    playerRubies: number;
    playerName: string;
    sheriffId: string | null;
    deputies: string[];
    activeThieves: Record<string, any>;
    selectedPlayerBuildings: PlacedBuilding[];
    buildingData: Building[];
    playerStatusMeta: PlayerStatusMeta;
    achievementPercentages?: Record<string, number>;
    onSelectTitle?: (title: string | null) => void;
    onClaimReward?: (tierId: string, rubies: number) => void;
    onPraisePlayer: (uid: string) => void;
    onComplainPlayer: (uid: string) => void;
    onVoteKing: (uid: string) => void;
    onAddFriend: (uid: string) => void;
    onOpenPrivateChat: (uid: string, mode?: 'mail' | 'private') => void;
    onCatchCriminal: (uid: string) => void;
    onTeleportToBuilding: (x: number, y: number) => void;
    onBanPlayer: (uid: string, cost: number, durationMinutes: number) => void;
    onPunishPlayer: (uid: string, cost: number, gloryPenalty: number, label: string) => void;
    onCursePlayer: (uid: string, cost: number, durationMinutes: number, prefix: string, label: string) => void;
    onBuyRubies?: () => void;
    onGift?: () => void;
    onCharacter?: () => void;
}

const OtherPlayerProfileModalComponent: React.FC<OtherPlayerProfileModalProps> = ({
    isOpen,
    selectedPlayerId,
    onClose,
    allUsers,
    user,
    playerLevel,
    playerGlory,
    playerReputation,
    playerGold,
    playerRubies,
    sheriffId,
    deputies,
    activeThieves,
    selectedPlayerBuildings,
    buildingData,
    playerStatusMeta,
    achievementPercentages = {},
    onSelectTitle,
    onClaimReward,
    onPraisePlayer,
    onComplainPlayer,
    onVoteKing,
    onAddFriend,
    onOpenPrivateChat,
    onCatchCriminal,
    onTeleportToBuilding,
    onBanPlayer,
    onPunishPlayer,
    onCursePlayer,
    onBuyRubies,
    onGift,
    onCharacter
}) => {
    const [showBanMenu, setShowBanMenu] = useState(false);
    const [showPunishMenu, setShowPunishMenu] = useState(false);
    const [showCurseMenu, setShowCurseMenu] = useState(false);
    const [showBuildingsMenu, setShowBuildingsMenu] = useState(false);
    const [showAchievementsMenu, setShowAchievementsMenu] = useState(false);
    const [showMessageMenu, setShowMessageMenu] = useState(false);

    if (!isOpen || !selectedPlayerId) return null;

    const handleCloseModal = () => {
        setShowBanMenu(false);
        setShowPunishMenu(false);
        setShowCurseMenu(false);
        setShowBuildingsMenu(false);
        setShowAchievementsMenu(false);
        setShowMessageMenu(false);
        onClose();
    };

    const targetUser = allUsers[selectedPlayerId];
    const isCurrentPlayer = selectedPlayerId === user?.uid;
    const isSheriffOrDeputy = sheriffId === user?.uid || deputies.includes(user?.uid || '');
    const isTargetThief = !!activeThieves[selectedPlayerId];

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 select-none animate-fade-in p-0 m-0" 
            onClick={handleCloseModal}
        >
            {/* Modal Container: exact Penpot canvas 596 x 760 */}
            <div 
                id="player-profile-modal-container"
                className="relative select-none text-white overflow-hidden animate-scale-up" 
                style={{
                    width: '596px',
                    height: '760px',
                    minWidth: '596px',
                    minHeight: '760px',
                    maxWidth: '596px',
                    maxHeight: '760px',
                    transform: 'scale(min(1, calc((100vw - 16px) / 596), calc((100vh - 16px) / 760)))',
                    transformOrigin: 'center center'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 1. Window Background (Penpot: 0, 0, 596x760) */}
                <img
                    id="profile-window-frame"
                    src="/Gui/GUI_Menu_Profile/assets/04_empty_profile_window_2x.png"
                    alt=""
                    className="absolute inset-0 w-[596px] h-[760px] pointer-events-none select-none z-0 block"
                    draggable={false}
                />

                {/* 2. Header Area */}
                <div id="profile-header-area" className="relative z-10">
                    {/* Neon User Icon: Penpot rel (20, 15, 118x102) */}
                    <div 
                        id="profile-header-icon"
                        style={{ position: 'absolute', left: '20px', top: '15px', width: '118px', height: '102px' }}
                    >
                        <img
                            src="/Gui/GUI_Menu_Profile/assets/icon_profile_neon.png"
                            alt="Profile"
                            className="w-full h-full object-contain pointer-events-none select-none"
                            draggable={false}
                        />
                    </div>

                    {/* Title & Subtitle: Penpot area (142, 34, 355x65) */}
                    <div 
                        id="profile-header-text"
                        style={{ position: 'absolute', left: '142px', top: '34px', width: '355px' }}
                    >
                        <h2 className="text-[26px] font-black tracking-wide leading-none m-0 p-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-baseline gap-2 font-sans">
                            <span className="text-white">Профиль</span>
                            <span className="text-[#fbbf24]">игрока</span>
                        </h2>
                        <p className="text-[13px] text-[#b49dc7] font-medium leading-tight m-0 mt-2 p-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-sans">
                            Информация и действия с жителем
                        </p>
                    </div>

                    {/* Close Button: Penpot rel (508, 25, 61x63) */}
                    <button
                        id="profile-header-close"
                        type="button"
                        onClick={handleCloseModal}
                        style={{ position: 'absolute', left: '508px', top: '25px', width: '61px', height: '63px' }}
                        className="p-0 border-0 bg-transparent cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none drop-shadow-[0_0_10px_rgba(217,70,239,0.7)] flex items-center justify-center"
                        title="Закрыть"
                    >
                        <img
                            src="/Gui/GUI_Menu_Profile/assets/close_tight.png"
                            alt="✕"
                            className="w-full h-full object-contain pointer-events-none select-none"
                            draggable={false}
                        />
                    </button>
                </div>

                {/* 3. Player Card: Penpot rel (4, 100, 577x193) */}
                <div 
                    id="profile-card"
                    style={{
                        position: 'absolute',
                        left: '4px',
                        top: '100px',
                        width: '577px',
                        height: '193px',
                        backgroundImage: 'url(/Gui/GUI_Menu_Profile/assets/panel_card_bg.png)',
                        backgroundSize: '100% 100%',
                        backgroundRepeat: 'no-repeat'
                    }}
                    className="z-10 overflow-hidden"
                >
                    {/* Royal Emblem: Penpot rel (21, 101, 194x176) -> relative to card (17, 1, 194x176) */}
                    <div 
                        id="profile-royal-avatar"
                        style={{
                            position: 'absolute',
                            left: '17px',
                            top: '1px',
                            width: '194px',
                            height: '176px'
                        }}
                        className="flex items-center justify-center relative"
                    >
                        {/* Dynamic Avatar Circle: center at (97, 96), radius 48px -> left: 49px, top: 48px, w: 96px, h: 96px */}
                        <div 
                            style={{
                                position: 'absolute',
                                left: '49px',
                                top: '48px',
                                width: '96px',
                                height: '96px',
                                borderRadius: '50%',
                                overflow: 'hidden'
                            }}
                            className="flex items-center justify-center z-0"
                        >
                            {targetUser?.avatar ? (
                                <img
                                    src={targetUser.avatar}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-b from-[#3a1a5b] to-[#1a0a2b] flex items-center justify-center font-black text-white text-[38px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans">
                                    {targetUser?.name?.charAt(0) || '?'}
                                </div>
                            )}
                        </div>

                        {/* Royal Laurel Wreath & Crown Frame Sprite */}
                        <img
                            src="/Gui/GUI_Menu_Profile/assets/royal_avatar_frame_penpot.png"
                            alt="Crown & Wreath"
                            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                            draggable={false}
                        />
                    </div>

                    {/* Player Info Text: Penpot area relative to card (220, 22, 345x150) */}
                    <div 
                        id="profile-card-info"
                        style={{
                            position: 'absolute',
                            left: '220px',
                            top: '22px',
                            width: '345px',
                            height: '150px'
                        }}
                    >
                        {/* Row 1: Nickname */}
                        <div 
                            id="profile-nickname"
                            style={{
                                position: 'absolute',
                                left: '0px',
                                top: '0px',
                                right: '0px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {targetUser?.selectedTitle && (
                                <span className="text-yellow-400 font-extrabold text-[11px] bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 rounded-full mr-2 shadow-sm font-sans">
                                    [{targetUser.selectedTitle}]
                                </span>
                            )}
                            <span className="text-[25px] font-black text-white tracking-wide truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] font-sans">
                                {targetUser?.name || "Неизвестный игрок"}
                            </span>
                        </div>

                        {/* Row 2: Level */}
                        <div 
                            id="profile-level"
                            style={{
                                position: 'absolute',
                                left: '0px',
                                top: '38px',
                                fontSize: '15px',
                                color: '#c4b5d6',
                                fontWeight: 600
                            }}
                            className="font-sans"
                        >
                            Уровень: <span className="text-[#fbbf24] font-black text-[15px] ml-1 font-sans">{isCurrentPlayer ? playerLevel : (targetUser?.level || 1)}</span>
                        </div>

                        {/* Row 3: Stats (Trophy + Shield) */}
                        <div 
                            id="profile-stats"
                            style={{
                                position: 'absolute',
                                left: '0px',
                                top: '68px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                fontSize: '16px',
                                fontWeight: 800
                            }}
                            className="font-sans"
                        >
                            <div className="flex items-center gap-2 text-[#fbbf24] drop-shadow">
                                <span className="text-[17px]">🏆</span>
                                <span className="font-black text-[16px]">{isCurrentPlayer ? playerGlory : (targetUser?.glory || 0)}</span>
                            </div>
                            <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(168, 85, 247, 0.4)' }} />
                            <div className="flex items-center gap-2 text-[#93c5fd] drop-shadow">
                                <span className="text-[17px]">🛡️</span>
                                <span className="font-black text-[16px]">{isCurrentPlayer ? playerReputation : (targetUser?.reputation || 0)}</span>
                            </div>
                        </div>

                        {/* Row 4: Status */}
                        <div 
                            id="profile-status"
                            style={{
                                position: 'absolute',
                                left: '0px',
                                top: '100px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: 700
                            }}
                            className="font-sans"
                        >
                            <span 
                                style={{ width: '9px', height: '9px' }} 
                                className={`rounded-full inline-block ${playerStatusMeta.isOnline ? 'bg-[#4ade80] shadow-[0_0_8px_#4ade80]' : playerStatusMeta.dotClassName}`} 
                            />
                            <span className={playerStatusMeta.isOnline ? 'text-[#4ade80]' : playerStatusMeta.textClassName}>
                                {playerStatusMeta.isOnline ? 'Онлайн' : `Был: ${playerStatusMeta.label}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Main Buttons Grid OR Submenu */}
                {!showBanMenu && !showPunishMenu && !showCurseMenu && !showBuildingsMenu && !showAchievementsMenu && !showMessageMenu ? (
                    <div id="profile-buttons-area" className="relative z-10">
                        {/* Row 1: Y = 281 */}
                        <button
                            id="btn-praise"
                            type="button"
                            onClick={() => onPraisePlayer(selectedPlayerId)}
                            style={{ position: 'absolute', left: '19px', top: '281px', width: '279px', height: '65px' }}
                            className="p-0 border-0 bg-transparent cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 active:brightness-95 focus:outline-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                            title="Похвалить"
                        >
                            <img
                                src="/Gui/GUI_Menu_Profile/buttons/01_praise.png"
                                alt="Похвалить"
                                className="w-full h-full object-contain pointer-events-none select-none block"
                                draggable={false}
                            />
                        </button>
                        <button
                            id="btn-report"
                            type="button"
                            onClick={() => onComplainPlayer(selectedPlayerId)}
                            style={{ position: 'absolute', left: '290px', top: '281px', width: '279px', height: '65px' }}
                            className="p-0 border-0 bg-transparent cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 active:brightness-95 focus:outline-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                            title="Пожаловаться"
                        >
                            <img
                                src="/Gui/GUI_Menu_Profile/buttons/02_report.png"
                                alt="Пожаловаться"
                                className="w-full h-full object-contain pointer-events-none select-none block"
                                draggable={false}
                            />
                        </button>

                        {/* Row 2: Y = 343 */}
                        <button
                            id="btn-my_king"
                            type="button"
                            onClick={() => onVoteKing(selectedPlayerId)}
                            style={{ position: 'absolute', left: '18px', top: '343px', width: '279px', height: '65px' }}
                            className="p-0 border-0 bg-transparent cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 active:brightness-95 focus:outline-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                            title="Это мой король!"
                        >
                            <img
                                src="/Gui/GUI_Menu_Profile/buttons/03_my_king.png"
                                alt="Это мой король!"
                                className="w-full h-full object-contain pointer-events-none select-none block"
                                draggable={false}
                            />
                        </button>
                        <button
                            id="btn-achievements"
                            type="button"
                            onClick={() => setShowAchievementsMenu(true)}
                            style={{ position: 'absolute', left: '290px', top: '343px', width: '279px', height: '65px' }}
                            className="p-0 border-0 bg-transparent cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 active:brightness-95 focus:outline-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                            title="Очивки"
                        >
                            <img
                                src="/Gui/GUI_Menu_Profile/buttons/04_achievements.png"
                                alt="Очивки"
                                className="w-full h-full object-contain pointer-events-none select-none block"
                                draggable={false}
                            />
                        </button>

                        {/* Row 3: Y = 406 */}
                        <button
                            id="btn-rubies"
                            type="button"
                            onClick={() => onBuyRubies?.()}
                            style={{ position: 'absolute', left: '18px', top: '406px', width: '279px', height: '65px' }}
                            className="p-0 border-0 bg-transparent cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 active:brightness-95 focus:outline-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                            title="Купить рубины"
                        >
                            <img
                                src="/Gui/GUI_Menu_Profile/buttons/05_buy_rubies.png"
                                alt="Купить рубины"
                                className="w-full h-full object-contain pointer-events-none select-none block"
                                draggable={false}
                            />
                        </button>
                        <button
                            id="btn-buildings"
                            type="button"
                            onClick={() => setShowBuildingsMenu(true)}
                            style={{ position: 'absolute', left: '290px', top: '406px', width: '279px', height: '65px' }}
                            className="p-0 border-0 bg-transparent cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 active:brightness-95 focus:outline-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                            title="Постройки"
                        >
                            <img
                                src="/Gui/GUI_Menu_Profile/buttons/06_buildings.png"
                                alt="Постройки"
                                className="w-full h-full object-contain pointer-events-none select-none block"
                                draggable={false}
                            />
                        </button>

                        {/* Row 4: Y = 465 */}
                        <button
                            id="btn-gift"
                            type="button"
                            onClick={() => onGift?.()}
                            style={{ position: 'absolute', left: '20px', top: '465px', width: '279px', height: '65px' }}
                            className="p-0 border-0 bg-transparent cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 active:brightness-95 focus:outline-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                            title="Подарить"
                        >
                            <img
                                src="/Gui/GUI_Menu_Profile/buttons/07_gift.png"
                                alt="Подарить"
                                className="w-full h-full object-contain pointer-events-none select-none block"
                                draggable={false}
                            />
                        </button>
                        <button
                            id="btn-friends"
                            type="button"
                            onClick={() => onAddFriend(selectedPlayerId)}
                            style={{ position: 'absolute', left: '290px', top: '465px', width: '279px', height: '65px' }}
                            className="p-0 border-0 bg-transparent cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 active:brightness-95 focus:outline-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                            title="Друзья"
                        >
                            <img
                                src="/Gui/GUI_Menu_Profile/buttons/08_friends.png"
                                alt="Друзья"
                                className="w-full h-full object-contain pointer-events-none select-none block"
                                draggable={false}
                            />
                        </button>

                        {/* Row 5: Y = 525 */}
                        <button
                            id="btn-messages"
                            type="button"
                            onClick={() => setShowMessageMenu(true)}
                            style={{ position: 'absolute', left: '18px', top: '525px', width: '279px', height: '65px' }}
                            className="p-0 border-0 bg-transparent cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 active:brightness-95 focus:outline-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                            title="Сообщения"
                        >
                            <img
                                src="/Gui/GUI_Menu_Profile/buttons/09_messages.png"
                                alt="Сообщения"
                                className="w-full h-full object-contain pointer-events-none select-none block"
                                draggable={false}
                            />
                        </button>
                        <button
                            id="btn-punish"
                            type="button"
                            onClick={() => setShowPunishMenu(true)}
                            style={{ position: 'absolute', left: '292px', top: '525px', width: '279px', height: '65px' }}
                            className="p-0 border-0 bg-transparent cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 active:brightness-95 focus:outline-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                            title="Наказать"
                        >
                            <img
                                src="/Gui/GUI_Menu_Profile/buttons/10_punish.png"
                                alt="Наказать"
                                className="w-full h-full object-contain pointer-events-none select-none block"
                                draggable={false}
                            />
                        </button>

                        {/* Row 6: Y = 585 */}
                        <button
                            id="btn-curse"
                            type="button"
                            onClick={() => setShowCurseMenu(true)}
                            style={{ position: 'absolute', left: '18px', top: '585px', width: '279px', height: '65px' }}
                            className="p-0 border-0 bg-transparent cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 active:brightness-95 focus:outline-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                            title="Заколдовать"
                        >
                            <img
                                src="/Gui/GUI_Menu_Profile/buttons/11_curse.png"
                                alt="Заколдовать"
                                className="w-full h-full object-contain pointer-events-none select-none block"
                                draggable={false}
                            />
                        </button>
                        <button
                            id="btn-character"
                            type="button"
                            onClick={() => onCharacter?.()}
                            style={{ position: 'absolute', left: '292px', top: '585px', width: '279px', height: '65px' }}
                            className="p-0 border-0 bg-transparent cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 active:brightness-95 focus:outline-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                            title="Персонаж"
                        >
                            <img
                                src="/Gui/GUI_Menu_Profile/buttons/12_character.png"
                                alt="Персонаж"
                                className="w-full h-full object-contain pointer-events-none select-none block"
                                draggable={false}
                            />
                        </button>

                        {/* Ban Button: Penpot rel (15, 650, 554x83) */}
                        <button
                            id="btn-ban"
                            type="button"
                            onClick={() => setShowBanMenu(true)}
                            style={{ position: 'absolute', left: '15px', top: '650px', width: '554px', height: '83px' }}
                            className="p-0 border-0 bg-transparent cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 active:brightness-95 focus:outline-none drop-shadow-[0_2px_8px_rgba(220,38,38,0.5)]"
                            title="Забанить"
                        >
                            <img
                                src="/Gui/GUI_Menu_Profile/buttons/13_ban.png"
                                alt="Забанить"
                                className="w-full h-full object-contain pointer-events-none select-none block"
                                draggable={false}
                            />
                        </button>

                        {/* Conditional Catch Criminal Button */}
                        {isSheriffOrDeputy && isTargetThief && (
                            <button 
                                id="btn-catch-criminal"
                                type="button"
                                onClick={() => onCatchCriminal(selectedPlayerId)}
                                style={{ position: 'absolute', left: '15px', top: '740px', width: '554px', height: '44px' }}
                                className="py-2 px-4 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 border-2 border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.7)] animate-pulse transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer font-sans z-30"
                            >
                                <span className="text-base">🚨</span> <span>Поймать преступника!</span>
                            </button>
                        )}
                    </div>
                ) : (
                    /* Submenu Container (fills buttons area Y: 281..735) */
                    <div 
                        id="profile-submenu-container"
                        style={{
                            position: 'absolute',
                            left: '18px',
                            top: '281px',
                            width: '554px',
                            height: '452px'
                        }}
                        className="z-20 flex flex-col"
                    >
                        {showAchievementsMenu ? (
                            <div className="bg-[#150a24]/95 border-2 border-purple-500/50 rounded-2xl p-3 flex flex-col flex-1 overflow-hidden shadow-[0_0_25px_rgba(168,85,247,0.4)] backdrop-blur-md">
                                <AchievementsView
                                    isOwnProfile={isCurrentPlayer}
                                    playerName={targetUser?.name || "Игрок"}
                                    playerAvatar={targetUser?.avatar}
                                    completedAchievements={targetUser?.achievements || targetUser?.data?.achievements || []}
                                    claimedAchievements={targetUser?.claimedAchievements || targetUser?.data?.claimedAchievements || []}
                                    selectedTitle={targetUser?.selectedTitle || targetUser?.data?.selectedTitle || null}
                                    stats={targetUser || {}}
                                    percentages={achievementPercentages}
                                    onClaimReward={isCurrentPlayer ? onClaimReward : undefined}
                                    onSelectTitle={isCurrentPlayer ? onSelectTitle : undefined}
                                    onBack={() => setShowAchievementsMenu(false)}
                                />
                            </div>
                        ) : showBuildingsMenu ? (
                            <div className="bg-[#150a24]/95 border-2 border-purple-500/50 rounded-2xl p-3 flex flex-col flex-1 overflow-hidden shadow-[0_0_25px_rgba(168,85,247,0.4)] backdrop-blur-md">
                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-purple-500/30">
                                    <span className="text-[#fef08a] font-black text-sm flex items-center gap-1.5 drop-shadow font-sans">
                                        <span>🏗️</span> Постройки игрока
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={() => setShowBuildingsMenu(false)} 
                                        className="text-xs text-purple-200 hover:text-white font-extrabold px-3 py-1 rounded-xl bg-purple-900/50 hover:bg-purple-800/80 border border-purple-400/40 transition-all flex items-center gap-1 cursor-pointer shadow-md font-sans"
                                    >
                                        <span>← Назад</span>
                                    </button>
                                </div>
                                <div className="overflow-y-auto space-y-1.5 pr-1 custom-scrollbar flex-1">
                                    {selectedPlayerBuildings.length > 0 ? (
                                        selectedPlayerBuildings.map(b => {
                                            const info = buildingData.find(i => i.id === b.buildingId);
                                            return (
                                                <div key={b.id} className="bg-purple-950/40 p-2 rounded-xl flex items-center justify-between border border-purple-400/25 hover:border-purple-400/60 transition-all group shadow-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-8 h-8 bg-black/40 rounded-lg flex items-center justify-center p-1 border border-white/10 shadow-inner">
                                                            {info && <img src={info.imageUrl} alt={info.name} className="max-w-full max-h-full object-contain" />}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <div className="text-xs font-bold text-white truncate w-36 group-hover:text-yellow-300 transition-colors font-sans">{info?.name || "Здание"}</div>
                                                            <div className="text-[10px] text-purple-300/70 font-mono">[{b.x}, {b.y}]</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            onTeleportToBuilding(b.x, b.y);
                                                            handleCloseModal();
                                                        }}
                                                        className="p-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-white transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer border border-purple-300/30"
                                                        title="Телепортироваться к зданию"
                                                    >
                                                        <CompassIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8 text-purple-300/60 text-xs italic font-sans">Построек пока не найдено</div>
                                    )}
                                </div>
                            </div>
                        ) : showBanMenu ? (
                            <div className="bg-[#1a0a14]/95 border-2 border-red-500/50 rounded-2xl p-3 flex flex-col flex-1 overflow-hidden shadow-[0_0_25px_rgba(239,68,68,0.35)] backdrop-blur-md">
                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-red-500/30">
                                    <span className="text-rose-300 font-black text-sm flex items-center gap-1.5 drop-shadow font-sans">
                                        <span>🚫</span> Бан игрока
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={() => setShowBanMenu(false)} 
                                        className="text-xs text-rose-200 hover:text-white font-extrabold px-3 py-1 rounded-xl bg-red-950/70 hover:bg-red-900/90 border border-red-500/40 transition-all flex items-center gap-1 cursor-pointer shadow-md font-sans"
                                    >
                                        <span>← Назад</span>
                                    </button>
                                </div>
                                <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
                                    {BAN_OPTIONS.map((option, idx) => {
                                        const targetRep = targetUser?.reputation || 0;
                                        const multiplier = 1 + Math.floor(Math.max(0, targetRep) / 5);
                                        const dynamicCost = option.cost * multiplier;
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => onBanPlayer(selectedPlayerId, dynamicCost, option.durationMinutes)}
                                                disabled={playerGold < dynamicCost}
                                                className="w-full bg-gradient-to-r from-red-950/70 to-rose-950/70 hover:from-red-900/80 hover:to-rose-900/80 disabled:opacity-40 text-white py-2 px-3 rounded-xl text-xs flex justify-between items-center transition-all border border-red-500/30 hover:border-red-400 shadow-md font-semibold cursor-pointer disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] font-sans"
                                            >
                                                <span className="font-bold">{option.label}</span>
                                                <span className="text-yellow-300 font-black drop-shadow">{dynamicCost.toLocaleString()} монет</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : showPunishMenu ? (
                            <div className="bg-[#1a0a14]/95 border-2 border-red-500/50 rounded-2xl p-3 flex flex-col flex-1 overflow-hidden shadow-[0_0_25px_rgba(239,68,68,0.35)] backdrop-blur-md">
                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-red-500/30">
                                    <span className="text-rose-300 font-black text-sm flex items-center gap-1.5 drop-shadow font-sans">
                                        <span>⚖️</span> Наказание жителя
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={() => setShowPunishMenu(false)} 
                                        className="text-xs text-rose-200 hover:text-white font-extrabold px-3 py-1 rounded-xl bg-red-950/70 hover:bg-red-900/90 border border-red-500/40 transition-all flex items-center gap-1 cursor-pointer shadow-md font-sans"
                                    >
                                        <span>← Назад</span>
                                    </button>
                                </div>
                                <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
                                    {PUNISHMENT_OPTIONS.map((option, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => onPunishPlayer(selectedPlayerId, option.cost, option.gloryPenalty, option.label)}
                                            disabled={playerRubies < option.cost}
                                            className="w-full bg-gradient-to-r from-red-950/70 to-rose-950/70 hover:from-red-900/80 hover:to-rose-900/80 disabled:opacity-40 text-white py-2 px-3 rounded-xl text-xs flex justify-between items-center transition-all border border-red-500/30 hover:border-red-400 shadow-md font-semibold cursor-pointer disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] font-sans"
                                        >
                                            <span className="font-bold">{option.label}</span>
                                            <span className="text-pink-400 font-black drop-shadow">{option.cost} ₽</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : showMessageMenu ? (
                            <div className="bg-[#121424]/95 border-2 border-purple-500/50 rounded-2xl p-4 flex flex-col flex-1 overflow-hidden shadow-[0_0_25px_rgba(168,85,247,0.35)] backdrop-blur-md">
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-purple-500/30">
                                    <span className="text-purple-300 font-black text-sm flex items-center gap-2 drop-shadow font-sans">
                                        <span>✉️</span> Написать игроку {targetUser?.name || ''}
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={() => setShowMessageMenu(false)} 
                                        className="text-xs text-purple-200 hover:text-white font-extrabold px-3 py-1 rounded-xl bg-purple-900/50 hover:bg-purple-800/80 border border-purple-400/40 transition-all flex items-center gap-1 cursor-pointer shadow-md font-sans"
                                    >
                                        <span>← Назад</span>
                                    </button>
                                </div>
                                <div className="space-y-4 flex flex-col justify-center flex-1 px-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowMessageMenu(false);
                                            onOpenPrivateChat(selectedPlayerId, 'mail');
                                        }}
                                        className="w-full bg-gradient-to-r from-amber-700/90 via-amber-600/90 to-amber-700/90 hover:from-amber-600 hover:via-amber-500 hover:to-amber-600 text-white p-4 rounded-2xl text-sm flex items-center justify-between transition-all border-2 border-amber-400/60 shadow-[0_4px_15px_rgba(245,158,11,0.25)] font-bold cursor-pointer hover:scale-[1.02] active:scale-[0.98] font-sans group"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-11 h-11 rounded-xl bg-amber-950/60 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                                                ✉️
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="font-black text-base text-amber-100">Отправить обычное сообщение</span>
                                                <span className="text-[11px] text-amber-200/80 font-medium">Придёт во вкладку «Письма» (видно ваш ник)</span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-amber-200 font-black bg-black/40 px-3 py-1.5 rounded-xl border border-amber-400/40">Бесплатно</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowMessageMenu(false);
                                            onOpenPrivateChat(selectedPlayerId, 'private');
                                        }}
                                        className="w-full bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-900/90 hover:from-purple-800 hover:via-indigo-800 hover:to-purple-800 text-white p-4 rounded-2xl text-sm flex items-center justify-between transition-all border-2 border-purple-400/60 shadow-[0_4px_15px_rgba(168,85,247,0.25)] font-bold cursor-pointer hover:scale-[1.02] active:scale-[0.98] font-sans group"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-11 h-11 rounded-xl bg-purple-950/60 border border-purple-400/40 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                                                🔒
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="font-black text-base text-purple-100">Отправить приватное сообщение</span>
                                                <span className="text-[11px] text-purple-300/80 font-medium">Придёт во вкладку «Приватные» (анонимно)</span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-yellow-300 font-black bg-black/40 px-3 py-1.5 rounded-xl border border-purple-400/40">500 🪙 + 1 ⚡</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#150a24]/95 border-2 border-purple-500/50 rounded-2xl p-3 flex flex-col flex-1 overflow-hidden shadow-[0_0_25px_rgba(168,85,247,0.35)] backdrop-blur-md">
                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-purple-500/30">
                                    <span className="text-purple-300 font-black text-sm flex items-center gap-1.5 drop-shadow font-sans">
                                        <span>🔮</span> Заколдовать игрока
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={() => setShowCurseMenu(false)} 
                                        className="text-xs text-purple-200 hover:text-white font-extrabold px-3 py-1 rounded-xl bg-purple-900/50 hover:bg-purple-800/80 border border-purple-400/40 transition-all flex items-center gap-1 cursor-pointer shadow-md font-sans"
                                    >
                                        <span>← Назад</span>
                                    </button>
                                </div>
                                <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
                                    {CURSE_OPTIONS.map((option, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => onCursePlayer(selectedPlayerId, option.cost, option.durationMinutes, option.prefix, option.label)}
                                            disabled={playerGold < option.cost}
                                            className="w-full bg-gradient-to-r from-purple-950/70 to-indigo-950/70 hover:from-purple-900/80 hover:to-indigo-900/80 disabled:opacity-40 text-white py-2 px-3 rounded-xl text-xs flex justify-between items-center transition-all border border-purple-500/30 hover:border-purple-400 shadow-md font-semibold cursor-pointer disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] font-sans"
                                        >
                                            <span className="font-bold">{option.label}</span>
                                            <span className="text-yellow-300 font-black drop-shadow">{option.cost.toLocaleString()} монет</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export const OtherPlayerProfileModal = memo(OtherPlayerProfileModalComponent, (prev, next) => {
    if (!prev.isOpen && !next.isOpen) return true;
    if (prev.isOpen !== next.isOpen) return false;
    if (prev.selectedPlayerId !== next.selectedPlayerId) return false;
    if (prev.playerGold !== next.playerGold) return false;
    if (prev.playerRubies !== next.playerRubies) return false;
    if (prev.allUsers !== next.allUsers) return false;
    if (prev.activeThieves !== next.activeThieves) return false;
    if (prev.selectedPlayerBuildings !== next.selectedPlayerBuildings) return false;
    if (prev.playerStatusMeta !== next.playerStatusMeta) return false;
    if (prev.achievementPercentages !== next.achievementPercentages) return false;
    return true;
});
