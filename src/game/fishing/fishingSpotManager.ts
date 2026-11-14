import { FishingSpot } from './fishingTypes';
import { isRiverBuilding } from '../buildings/riverAutotile';
import type { PlacedBuilding } from '../../../types';

export class FishingSpotManager {
  private spots: FishingSpot[] = [];
  private lastSpawnCheck: number = 0;
  private lastCleanupCheck: number = 0;
  private cachedRiverTiles: PlacedBuilding[] | null = null;
  private lastPlacedBuildingsRef: PlacedBuilding[] | null = null;

  public getSpots(): FishingSpot[] {
    return this.spots;
  }

  public getSpotAt(x: number, y: number): FishingSpot | undefined {
    return this.spots.find(s => s.x === x && s.y === y && s.fishCount > 0);
  }

  public getNearbySpot(playerX: number, playerY: number, maxDist: number = 1.8): FishingSpot | undefined {
    return this.spots.find(s => {
      const dist = Math.hypot(s.x - playerX, s.y - playerY);
      return dist <= maxDist && s.fishCount > 0;
    });
  }

  public update(placedBuildings: PlacedBuilding[], maxSpots: number = 5, now: number = Date.now()): FishingSpot[] {
    // 1. Remove expired or depleted spots (throttled to every 2 seconds instead of every 16ms RAF frame)
    if (this.spots.length > 0 && (now - this.lastCleanupCheck >= 2000)) {
      this.lastCleanupCheck = now;
      this.spots = this.spots.filter(s => s.fishCount > 0 && s.expiresAt > now);
    }

    // 2. Throttle spawning check to every 4 seconds
    if (now - this.lastSpawnCheck < 4000) {
      return this.spots;
    }
    this.lastSpawnCheck = now;

    // 3. Find candidate river tiles from cached list
    if (this.spots.length < maxSpots) {
      if (this.lastPlacedBuildingsRef !== placedBuildings || !this.cachedRiverTiles) {
        this.lastPlacedBuildingsRef = placedBuildings;
        this.cachedRiverTiles = placedBuildings.filter(b => 
          isRiverBuilding(b.buildingId) && (b.hp === undefined || b.hp > 0)
        );
      }
      const riverTiles = this.cachedRiverTiles;

      if (riverTiles.length > 0) {
        // Find river tiles without an active spot
        const occupiedCoords = new Set(this.spots.map(s => `${s.x}_${s.y}`));
        const available = riverTiles.filter(r => !occupiedCoords.has(`${r.x}_${r.y}`));

        const needed = maxSpots - this.spots.length;
        for (let i = 0; i < needed && available.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * available.length);
          const chosen = available.splice(randomIndex, 1)[0];

          const durationMs = 180000 + Math.random() * 180000; // 3 to 6 mins
          this.spots.push({
            id: `spot_${chosen.x}_${chosen.y}_${now}`,
            x: chosen.x,
            y: chosen.y,
            fishCount: 3 + Math.floor(Math.random() * 3), // 3 to 5 catches
            createdAt: now,
            expiresAt: now + durationMs
          });
        }
      }
    }

    return this.spots;
  }

  public consumeCatch(spotId: string): void {
    const spot = this.spots.find(s => s.id === spotId);
    if (spot) {
      spot.fishCount -= 1;
      if (spot.fishCount <= 0) {
        this.spots = this.spots.filter(s => s.id !== spotId);
      }
    }
  }
}

export const fishingSpotManager = new FishingSpotManager();
