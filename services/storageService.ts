
import { UserProfile, PlacedBuilding } from '../types';

const STORAGE_PREFIX = 'game_user_';
const USERS_LIST_KEY = 'game_users_list';

// Helper to update the master list of users
const registerUserInList = (username: string) => {
    try {
        const listStr = localStorage.getItem(USERS_LIST_KEY);
        const list: string[] = listStr ? JSON.parse(listStr) : [];
        if (!list.includes(username)) {
            list.push(username);
            localStorage.setItem(USERS_LIST_KEY, JSON.stringify(list));
        }
    } catch (e) {
        console.error("Failed to update user list", e);
    }
};

export const saveUserProfile = (profile: UserProfile) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + profile.username, JSON.stringify(profile));
    registerUserInList(profile.username);
  } catch (e) {
    console.error("Failed to save profile", e);
  }
};

export const loadUserProfile = (username: string): UserProfile | null => {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + username);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Failed to load profile", e);
    return null;
  }
};

export const userExists = (username: string): boolean => {
    return !!localStorage.getItem(STORAGE_PREFIX + username);
};

// New function to gather buildings from ALL other users
export const getAllOtherBuildings = (currentUsername: string): PlacedBuilding[] => {
    try {
        const listStr = localStorage.getItem(USERS_LIST_KEY);
        const list: string[] = listStr ? JSON.parse(listStr) : [];
        
        let allBuildings: PlacedBuilding[] = [];

        list.forEach(username => {
            if (username === currentUsername) return; // Skip current user

            const profile = loadUserProfile(username);
            if (profile && profile.buildings) {
                // Generate a pseudo-random ownerId (1-3) based on name length for color variety
                // ownerId 0 is reserved for the current player
                const pseudoOwnerId = (username.length % 3) + 1;

                const othersBuildings = profile.buildings.map(b => ({
                    ...b,
                    ownerId: pseudoOwnerId,
                    isConstructing: false, // Don't show construction bars for others (simpler)
                    constructionEndTime: 0 
                }));
                allBuildings = [...allBuildings, ...othersBuildings];
            }
        });

        return allBuildings;
    } catch (e) {
        console.error("Failed to load other buildings", e);
        return [];
    }
};
