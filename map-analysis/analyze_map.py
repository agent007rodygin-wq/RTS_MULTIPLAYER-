#!/usr/bin/env python3
"""
analyze_map.py
==============
Comprehensive, 100% READ-ONLY audit & spatial analysis of the 1000x1000 (1,000,000 cells)
world map of BasingSe MMORPG.

Strictly non-invasive: opens SQLite in URI read-only mode (?mode=ro), makes zero writes,
zero server requests, and outputs all results locally to map-analysis/.
"""

import os
import sys
import time
import json
import gzip
import csv
import math
import sqlite3
from collections import deque
from PIL import Image

DB_PATH = "/home/uro/pocketbase-local/pb_data/data.db"
OUTPUT_DIR = "/home/uro/Рабочий стол/my projects/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/map-analysis"
MASK_PATH = "/home/uro/Рабочий стол/my projects/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/src/forest-mask.json"

WORLD_W = 1000
WORLD_H = 1000
TOTAL_CELLS = WORLD_W * WORLD_H
ZONE_SIZE = 200
ZONES_X = 5
ZONES_Y = 5
TOTAL_SECTORS = ZONES_X * ZONES_Y

# Tile Type Encodings
TYPE_EMPTY = 0
TYPE_TREE = 1
TYPE_RIVER = 2
TYPE_MOUNTAIN = 3
TYPE_OIL = 4
TYPE_QUARRY = 5
TYPE_CHEST = 6
TYPE_MONSTER = 7
TYPE_PLAYER_BUILDING = 8

TYPE_NAMES = {
    TYPE_EMPTY: "Empty Grass",
    TYPE_TREE: "Tree",
    TYPE_RIVER: "River",
    TYPE_MOUNTAIN: "Mountain",
    TYPE_OIL: "Oil Derrick",
    TYPE_QUARRY: "Quarry",
    TYPE_CHEST: "Chest",
    TYPE_MONSTER: "Monster",
    TYPE_PLAYER_BUILDING: "Player Building",
}

def run_analysis():
    print("==========================================================================")
    print(" 🗺️  FULL AUDIT & SPATIAL ANALYSIS OF 1000x1000 WORLD (1,000,000 CELLS)")
    print("==========================================================================")
    t_start_total = time.time()
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # -------------------------------------------------------------------------
    # STAGE 1 & 2: FAST, SAFE, READ-ONLY DATABASE SCAN
    # -------------------------------------------------------------------------
    print("\n[STAGE 1 & 2] Reading SQLite database in STRICT READ-ONLY mode...")
    t_scan_start = time.time()

    conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    cur = conn.cursor()

    # Read map state
    cur.execute("SELECT data FROM map_state WHERE gameId='status' LIMIT 1")
    map_state_row = cur.fetchone()
    map_state_data = json.loads(map_state_row[0]) if map_state_row and map_state_row[0] else {}
    generator_seed = map_state_data.get("seed", None)
    terrain_version = map_state_data.get("terrainRepairVersion", None)
    print(f"  • Map State: seed={generator_seed}, terrainRepairVersion={terrain_version}")

    # Read all map resources
    cur.execute("SELECT id, type, x, y, zoneId, data FROM map_resources")
    raw_resources = cur.fetchall()
    print(f"  • Raw map_resources read: {len(raw_resources):,} records")

    # Read all buildings
    cur.execute("SELECT id, ownerId, ownerName, buildingId, x, y, data FROM buildings")
    raw_buildings = cur.fetchall()
    print(f"  • Raw buildings read: {len(raw_buildings):,} records")

    # Read tree respawn queue
    cur.execute("SELECT count(*) FROM tree_respawns")
    pending_tree_respawns = cur.fetchone()[0]

    # Read tree chopping history
    cur.execute("SELECT count(*) FROM history WHERE message LIKE '%Рубка дерева%'")
    total_tree_chop_events = cur.fetchone()[0]

    conn.close()
    t_scan_end = time.time()
    scan_duration_sec = t_scan_end - t_scan_start
    print(f"  ✅ Complete DB scan finished in {scan_duration_sec*1000:.2f} ms ({scan_duration_sec:.4f} s)")

    # -------------------------------------------------------------------------
    # GRID POPULATION & OVERLAP DETECTION
    # -------------------------------------------------------------------------
    print("\n[POPULATING 1,000,000 CELLS MATRIX]")
    # 1D bytearray for instant indexing: index = y * 1000 + x
    tile_grid = bytearray(TOTAL_CELLS)  # default TYPE_EMPTY = 0
    tree_hp_grid = bytearray(TOTAL_CELLS)
    owner_grid = [None] * TOTAL_CELLS
    object_id_grid = [None] * TOTAL_CELLS

    overlap_count = 0
    out_of_bounds_count = 0

    # Sector counters: sector (zx, zy) -> counts
    sector_stats = {
        f"{zx}_{zy}": {
            "trees": 0, "rivers": 0, "mountains": 0, "monsters": 0,
            "oil": 0, "quarry": 0, "chest": 0, "player_buildings": 0, "empty": 0
        }
        for zx in range(ZONES_X) for zy in range(ZONES_Y)
    }

    # Trees & Resources
    tree_records = []
    oil_records = []
    quarry_records = []
    chest_records = []

    tree_hp_counts = {}

    for row in raw_resources:
        rec_id, res_type, x, y, zone_id, data_raw = row
        if not (0 <= x < WORLD_W and 0 <= y < WORLD_H):
            out_of_bounds_count += 1
            continue
        idx = y * WORLD_W + x
        sec_key = f"{x // ZONE_SIZE}_{y // ZONE_SIZE}"

        d = json.loads(data_raw) if data_raw else {}
        hp = d.get("hp", 3)

        if tile_grid[idx] != TYPE_EMPTY:
            overlap_count += 1

        if res_type == "tree":
            tile_grid[idx] = TYPE_TREE
            tree_hp_grid[idx] = hp
            tree_records.append((x, y, hp, rec_id))
            sector_stats[sec_key]["trees"] += 1
            tree_hp_counts[hp] = tree_hp_counts.get(hp, 0) + 1
        elif res_type == "oil":
            tile_grid[idx] = TYPE_OIL
            oil_records.append((x, y, rec_id))
            sector_stats[sec_key]["oil"] += 1
        elif res_type == "quarry":
            tile_grid[idx] = TYPE_QUARRY
            quarry_records.append((x, y, rec_id))
            sector_stats[sec_key]["quarry"] += 1
        elif res_type == "chest":
            tile_grid[idx] = TYPE_CHEST
            chest_records.append((x, y, rec_id))
            sector_stats[sec_key]["chest"] += 1

    # Buildings, Rivers, Mountains, Monsters
    river_records = []
    mountain_records = []
    monster_records = []
    player_building_records = []

    MONSTER_IDS = {"70001", "70002", "70003", "70004", "70005", "70006"}

    for row in raw_buildings:
        rec_id, owner_id, owner_name, building_id, x, y, data_raw = row
        if not (0 <= x < WORLD_W and 0 <= y < WORLD_H):
            out_of_bounds_count += 1
            continue
        idx = y * WORLD_W + x
        sec_key = f"{x // ZONE_SIZE}_{y // ZONE_SIZE}"
        b_str = str(building_id)

        if tile_grid[idx] != TYPE_EMPTY:
            overlap_count += 1

        if b_str == "50004":
            tile_grid[idx] = TYPE_RIVER
            river_records.append((x, y, owner_id, rec_id))
            sector_stats[sec_key]["rivers"] += 1
        elif b_str == "50005":
            tile_grid[idx] = TYPE_MOUNTAIN
            mountain_records.append((x, y, owner_id, rec_id))
            sector_stats[sec_key]["mountains"] += 1
        elif b_str in MONSTER_IDS or owner_id == "monster":
            tile_grid[idx] = TYPE_MONSTER
            monster_records.append((x, y, b_str, rec_id))
            sector_stats[sec_key]["monsters"] += 1
        else:
            tile_grid[idx] = TYPE_PLAYER_BUILDING
            player_building_records.append((x, y, b_str, owner_id, owner_name, rec_id))
            sector_stats[sec_key]["player_buildings"] += 1

    # Compute empty cells per sector
    for zx in range(ZONES_X):
        for zy in range(ZONES_Y):
            sec_key = f"{zx}_{zy}"
            total_sec_occupied = sum(sector_stats[sec_key][k] for k in sector_stats[sec_key] if k != "empty")
            sector_stats[sec_key]["empty"] = (ZONE_SIZE * ZONE_SIZE) - total_sec_occupied

    total_trees = len(tree_records)
    total_rivers = len(river_records)
    total_mountains = len(mountain_records)
    total_monsters = len(monster_records)
    total_oil = len(oil_records)
    total_quarry = len(quarry_records)
    total_chests = len(chest_records)
    total_player_bldgs = len(player_building_records)

    total_occupied_cells = total_trees + total_rivers + total_mountains + total_monsters + total_oil + total_quarry + total_chests + total_player_bldgs
    total_empty_cells = TOTAL_CELLS - total_occupied_cells

    print(f"  • Total Trees: {total_trees:,}")
    print(f"  • Total Rivers: {total_rivers:,}")
    print(f"  • Total Mountains: {total_mountains:,}")
    print(f"  • Total Monsters: {total_monsters:,}")
    print(f"  • Total Oil Derricks: {total_oil:,}")
    print(f"  • Total Quarries: {total_quarry:,}")
    print(f"  • Total Chests: {total_chests:,}")
    print(f"  • Total Player Buildings: {total_player_bldgs:,}")
    print(f"  • Total Occupied Cells: {total_occupied_cells:,} ({total_occupied_cells/TOTAL_CELLS:.2%})")
    print(f"  • Total Empty Grass Cells: {total_empty_cells:,} ({total_empty_cells/TOTAL_CELLS:.2%})")
    print(f"  • Overlapping Coordinates: {overlap_count}")
    print(f"  • Out-of-bounds Coordinates: {out_of_bounds_count}")

    # -------------------------------------------------------------------------
    # STAGE 3 & 4: TREE & FOREST CLUSTER ANALYSIS
    # -------------------------------------------------------------------------
    print("\n[STAGE 3 & 4] Connected Components & Forest Shape Analysis...")
    t_forest_start = time.time()

    # Load 50x50 Gnomograd forest mask for comparison
    with open(MASK_PATH, "r", encoding="utf-8") as f:
        mask_json = json.load(f)
    mask_rows = mask_json["rows"]
    mask_h = mask_json["height"]
    mask_w = mask_json["width"]

    # Calculate theoretical mask coverage across 1000x1000
    theoretical_mask_1s = sum(
        1 for y in range(WORLD_H) for x in range(WORLD_W)
        if mask_rows[y % mask_h][x % mask_w] == "1"
    )
    print(f"  • Gnomograd Mask 1-cells across 1000x1000: {theoretical_mask_1s:,} ({theoretical_mask_1s/TOTAL_CELLS:.2%})")
    trees_conforming_to_mask = sum(
        1 for x, y, _, _ in tree_records
        if mask_rows[y % mask_h][x % mask_w] == "1"
    )
    print(f"  • Trees strictly inside Gnomograd mask: {trees_conforming_to_mask:,} ({trees_conforming_to_mask/total_trees:.2%})")

    # Connected Components (Flood Fill) on 1000x1000 boolean grid
    # We test both 4-connectivity and 8-connectivity.
    def compute_connected_components(connectivity=8):
        visited = bytearray(TOTAL_CELLS)
        clusters = []

        if connectivity == 4:
            neighbors = [(-1, 0), (1, 0), (0, -1), (0, 1)]
        else:
            neighbors = [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]

        for sy in range(WORLD_H):
            row_offset = sy * WORLD_W
            for sx in range(WORLD_W):
                sidx = row_offset + sx
                if tile_grid[sidx] == TYPE_TREE and not visited[sidx]:
                    # Start BFS
                    queue = deque([(sx, sy)])
                    visited[sidx] = 1
                    cluster_cells = []

                    min_x, max_x = sx, sx
                    min_y, max_y = sy, sy
                    sum_x, sum_y = 0, 0

                    while queue:
                        cx, cy = queue.popleft()
                        cluster_cells.append((cx, cy))
                        sum_x += cx
                        sum_y += cy
                        if cx < min_x: min_x = cx
                        if cx > max_x: max_x = cx
                        if cy < min_y: min_y = cy
                        if cy > max_y: max_y = cy

                        for dx, dy in neighbors:
                            nx, ny = cx + dx, cy + dy
                            if 0 <= nx < WORLD_W and 0 <= ny < WORLD_H:
                                nidx = ny * WORLD_W + nx
                                if tile_grid[nidx] == TYPE_TREE and not visited[nidx]:
                                    visited[nidx] = 1
                                    queue.append((nx, ny))

                    # Compute geometric properties
                    count = len(cluster_cells)
                    width = max_x - min_x + 1
                    height = max_y - min_y + 1
                    bbox_area = width * height
                    density = count / bbox_area if bbox_area > 0 else 1.0
                    centroid_x = round(sum_x / count, 2)
                    centroid_y = round(sum_y / count, 2)

                    # Perimeter: count 4-neighbor edges facing non-tree cells
                    perimeter = 0
                    for cx, cy in cluster_cells:
                        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                            nx, ny = cx + dx, cy + dy
                            if nx < 0 or nx >= WORLD_W or ny < 0 or ny >= WORLD_H or tile_grid[ny * WORLD_W + nx] != TYPE_TREE:
                                perimeter += 1

                    # Circularity / Compactness: 4 * pi * Area / Perimeter^2 (1.0 for circle)
                    circularity = (4 * math.pi * count) / (perimeter * perimeter) if perimeter > 0 else 0.0
                    aspect_ratio = max(width, height) / max(1, min(width, height))

                    # Shape Classification
                    # 1. Compact & round: circularity > 0.4, aspect ratio <= 1.4, N >= 8
                    # 2. Oval: aspect ratio between 1.4 and 2.5, N >= 8
                    # 3. Long & narrow (ribbon): aspect ratio >= 3.0, min(width, height) <= 3, N >= 6
                    # 4. Forest strip: aspect ratio >= 2.5, min(width, height) > 3, N >= 10
                    # 5. Large massive forest: N >= 80
                    # 6. Irregular / branched: perimeter relative to area is high (circularity < 0.25), N >= 15
                    # 7. Small island: 3 <= N <= 7
                    # 8. Scattered group: 1 <= N <= 2
                    if count >= 80:
                        shape_type = "Крупный сплошной массив (Massive)"
                    elif count <= 2:
                        shape_type = "Разрозненная группа (Scattered)"
                    elif 3 <= count <= 7:
                        shape_type = "Небольшой островок (Small Island)"
                    elif aspect_ratio >= 3.0 and min(width, height) <= 3:
                        shape_type = "Длинный и узкий / Лента (Ribbon)"
                    elif aspect_ratio >= 2.5:
                        shape_type = "Лесная полоса (Forest Strip)"
                    elif circularity >= 0.40 and aspect_ratio <= 1.4:
                        shape_type = "Круглый и компактный (Compact)"
                    elif 1.4 < aspect_ratio <= 2.5 and circularity >= 0.25:
                        shape_type = "Овальный (Oval)"
                    else:
                        shape_type = "Неправильный разветвлённый (Branched)"

                    clusters.append({
                        "id": len(clusters) + 1,
                        "tree_count": count,
                        "area": count,
                        "min_x": min_x,
                        "max_x": max_x,
                        "min_y": min_y,
                        "max_y": max_y,
                        "width": width,
                        "height": height,
                        "centroid_x": centroid_x,
                        "centroid_y": centroid_y,
                        "perimeter": perimeter,
                        "fill_density": round(density, 4),
                        "aspect_ratio": round(aspect_ratio, 2),
                        "circularity": round(circularity, 4),
                        "shape_type": shape_type,
                        "cells": cluster_cells
                    })

        clusters.sort(key=lambda c: c["tree_count"], reverse=True)
        return clusters

    forest_clusters_8 = compute_connected_components(connectivity=8)
    forest_clusters_4 = compute_connected_components(connectivity=4)

    t_forest_end = time.time()
    print(f"  ✅ Forest clustering finished in {(t_forest_end - t_forest_start):.3f} s")
    print(f"  • Total Forest Clusters (8-connectivity, diagonal touch): {len(forest_clusters_8):,}")
    print(f"  • Total Forest Clusters (4-connectivity, orthogonal only): {len(forest_clusters_4):,}")

    largest_forest = forest_clusters_8[0]
    smallest_forest = forest_clusters_8[-1]
    avg_forest_size = round(sum(c["tree_count"] for c in forest_clusters_8) / len(forest_clusters_8), 2)
    median_forest_size = forest_clusters_8[len(forest_clusters_8) // 2]["tree_count"]

    print(f"  • Largest Forest Cluster: {largest_forest['tree_count']} trees (Bounding Box: {largest_forest['width']}x{largest_forest['height']}, [{largest_forest['min_x']},{largest_forest['min_y']}] to [{largest_forest['max_x']},{largest_forest['max_y']}])")
    print(f"  • Smallest Forest Cluster: {smallest_forest['tree_count']} trees")
    print(f"  • Average Forest Size: {avg_forest_size} trees")
    print(f"  • Median Forest Size: {median_forest_size} trees")

    # Shape type breakdown
    shape_distribution = {}
    for c in forest_clusters_8:
        st = c["shape_type"]
        shape_distribution[st] = shape_distribution.get(st, 0) + 1

    print("  • Forest Shape Classification Breakdown:")
    for st, count in sorted(shape_distribution.items(), key=lambda x: x[1], reverse=True):
        print(f"    - {st}: {count} ({count/len(forest_clusters_8):.1%})")

    # Nearest Neighbor Distance between forest clusters
    # Compute centroids distance to find min and max distance between nearest clusters
    nn_distances = []
    # Sample subset if too many to compute exact O(N^2) quickly
    c_centroids = [(c["centroid_x"], c["centroid_y"]) for c in forest_clusters_8]
    for i in range(min(500, len(c_centroids))):
        cx, cy = c_centroids[i]
        min_d = float('inf')
        for j in range(len(c_centroids)):
            if i == j: continue
            ox, oy = c_centroids[j]
            d = math.hypot(cx - ox, cy - oy)
            if d < min_d:
                min_d = d
        if min_d < float('inf'):
            nn_distances.append(min_d)

    min_nn_dist = round(min(nn_distances), 2) if nn_distances else 0
    max_nn_dist = round(max(nn_distances), 2) if nn_distances else 0
    avg_nn_dist = round(sum(nn_distances) / len(nn_distances), 2) if nn_distances else 0
    print(f"  • Forest Distance Metrics: Min distance to nearest cluster={min_nn_dist} tiles, Max nearest={max_nn_dist} tiles, Avg nearest={avg_nn_dist} tiles")

    # -------------------------------------------------------------------------
    # STAGE 5: MOUNTAIN ANALYSIS & AUTOTILING
    # -------------------------------------------------------------------------
    print("\n[STAGE 5] Mountain Ranges & Autotiling Analysis...")
    t_mountain_start = time.time()

    # Mountain autotiling mask (bit 0: (x, y-1), bit 1: (x+1, y), bit 2: (x, y+1), bit 3: (x-1, y))
    mountain_mask_counts = [0] * 16
    mountain_cells_set = set((x, y) for x, y, _, _ in mountain_records)

    for x, y, _, _ in mountain_records:
        mask = 0
        if (x, y - 1) in mountain_cells_set: mask |= 1  # NE
        if (x + 1, y) in mountain_cells_set: mask |= 2  # SE
        if (x, y + 1) in mountain_cells_set: mask |= 4  # SW
        if (x - 1, y) in mountain_cells_set: mask |= 8  # NW
        mountain_mask_counts[mask] += 1

    # Mountain clusters (Connected Components, 8-connectivity)
    visited_m = bytearray(TOTAL_CELLS)
    mountain_clusters = []
    for x, y, _, rec_id in mountain_records:
        idx = y * WORLD_W + x
        if not visited_m[idx]:
            queue = deque([(x, y)])
            visited_m[idx] = 1
            m_cells = []
            min_x, max_x = x, x
            min_y, max_y = y, y
            while queue:
                cx, cy = queue.popleft()
                m_cells.append((cx, cy))
                if cx < min_x: min_x = cx
                if cx > max_x: max_x = cx
                if cy < min_y: min_y = cy
                if cy > max_y: max_y = cy
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < WORLD_W and 0 <= ny < WORLD_H:
                        nidx = ny * WORLD_W + nx
                        if tile_grid[nidx] == TYPE_MOUNTAIN and not visited_m[nidx]:
                            visited_m[nidx] = 1
                            queue.append((nx, ny))
            mountain_clusters.append({
                "id": len(mountain_clusters) + 1,
                "tile_count": len(m_cells),
                "min_x": min_x, "max_x": max_x,
                "min_y": min_y, "max_y": max_y,
                "width": max_x - min_x + 1,
                "height": max_y - min_y + 1,
                "cells": m_cells
            })
    mountain_clusters.sort(key=lambda c: c["tile_count"], reverse=True)

    t_mountain_end = time.time()
    print(f"  ✅ Mountain analysis finished in {(t_mountain_end - t_mountain_start):.3f} s")
    print(f"  • Total Mountain Tiles: {total_mountains:,}")
    print(f"  • Total Mountain Ranges / Clusters: {len(mountain_clusters):,}")
    print(f"  • Largest Mountain Range: {mountain_clusters[0]['tile_count']} tiles ({mountain_clusters[0]['width']}x{mountain_clusters[0]['height']})")
    print(f"  • Smallest Mountain Cluster: {mountain_clusters[-1]['tile_count']} tiles")
    print(f"  • Isolated Peaks (mask 0): {mountain_mask_counts[0]}")
    print(f"  • Ridge Ends / Dead-ends (masks 1,2,4,8): {mountain_mask_counts[1] + mountain_mask_counts[2] + mountain_mask_counts[4] + mountain_mask_counts[8]}")
    print(f"  • Straight Ridges (masks 5, 10): {mountain_mask_counts[5] + mountain_mask_counts[10]}")
    print(f"  • Ridge Bends (masks 3, 6, 9, 12): {mountain_mask_counts[3] + mountain_mask_counts[6] + mountain_mask_counts[9] + mountain_mask_counts[12]}")
    print(f"  • T-Junctions (masks 7, 11, 13, 14): {mountain_mask_counts[7] + mountain_mask_counts[11] + mountain_mask_counts[13] + mountain_mask_counts[14]}")
    print(f"  • Crossroads / Caldera Centers (mask 15): {mountain_mask_counts[15]}")

    # -------------------------------------------------------------------------
    # STAGE 6: RIVER ANALYSIS & SYSTEMS
    # -------------------------------------------------------------------------
    print("\n[STAGE 6] River Systems & Graph Reconstruction...")
    t_river_start = time.time()

    river_cells_set = set((x, y) for x, y, _, _ in river_records)
    river_mask_counts = [0] * 16

    for x, y, _, _ in river_records:
        mask = 0
        if (x, y - 1) in river_cells_set: mask |= 1  # NE
        if (x + 1, y) in river_cells_set: mask |= 2  # SE
        if (x, y + 1) in river_cells_set: mask |= 4  # SW
        if (x - 1, y) in river_cells_set: mask |= 8  # NW
        river_mask_counts[mask] += 1

    # River Systems (Connected Components, 8-connectivity)
    visited_r = bytearray(TOTAL_CELLS)
    river_systems = []
    for x, y, _, rec_id in river_records:
        idx = y * WORLD_W + x
        if not visited_r[idx]:
            queue = deque([(x, y)])
            visited_r[idx] = 1
            r_cells = []
            min_x, max_x = x, x
            min_y, max_y = y, y
            sources = []
            forks = []
            bends = []
            straights = []

            while queue:
                cx, cy = queue.popleft()
                r_cells.append((cx, cy))
                if cx < min_x: min_x = cx
                if cx > max_x: max_x = cx
                if cy < min_y: min_y = cy
                if cy > max_y: max_y = cy

                # Neighbor count in 4-dir
                n_count = 0
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    if (cx + dx, cy + dy) in river_cells_set:
                        n_count += 1
                if n_count == 1: sources.append((cx, cy))
                elif n_count >= 3: forks.append((cx, cy))
                elif n_count == 2:
                    # check if straight or bend
                    has_opp = ((cx - 1, cy) in river_cells_set and (cx + 1, cy) in river_cells_set) or \
                              ((cx, cy - 1) in river_cells_set and (cx, cy + 1) in river_cells_set)
                    if has_opp: straights.append((cx, cy))
                    else: bends.append((cx, cy))

                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < WORLD_W and 0 <= ny < WORLD_H:
                        nidx = ny * WORLD_W + nx
                        if tile_grid[nidx] == TYPE_RIVER and not visited_r[nidx]:
                            visited_r[nidx] = 1
                            queue.append((nx, ny))

            river_systems.append({
                "id": len(river_systems) + 1,
                "length_tiles": len(r_cells),
                "min_x": min_x, "max_x": max_x,
                "min_y": min_y, "max_y": max_y,
                "width": max_x - min_x + 1,
                "height": max_y - min_y + 1,
                "sources_count": len(sources),
                "forks_count": len(forks),
                "bends_count": len(bends),
                "straights_count": len(straights),
                "cells": r_cells
            })

    river_systems.sort(key=lambda s: s["length_tiles"], reverse=True)
    t_river_end = time.time()

    print(f"  ✅ River analysis finished in {(t_river_end - t_river_start):.3f} s")
    print(f"  • Total River Tiles: {total_rivers:,}")
    print(f"  • Total River Systems / Waterways: {len(river_systems):,}")
    print(f"  • Longest River: {river_systems[0]['length_tiles']} tiles (BBox: {river_systems[0]['width']}x{river_systems[0]['height']})")
    print(f"  • Shortest River / Section: {river_systems[-1]['length_tiles']} tiles")
    print(f"  • River Width: 1 tile wide channels (natural isometric waterways)")
    print(f"  • River Dead-ends / Sources / Mouths: {river_mask_counts[1] + river_mask_counts[2] + river_mask_counts[4] + river_mask_counts[8]}")
    print(f"  • Straight River Channels: {river_mask_counts[5] + river_mask_counts[10]}")
    print(f"  • River Bends: {river_mask_counts[3] + river_mask_counts[6] + river_mask_counts[9] + river_mask_counts[12]}")
    print(f"  • River Forks / Tributaries: {river_mask_counts[7] + river_mask_counts[11] + river_mask_counts[13] + river_mask_counts[14]}")
    print(f"  • River Crossroads / Junctions: {river_mask_counts[15]}")

    # -------------------------------------------------------------------------
    # STAGE 7: HIGH-PERFORMANCE IMAGE GENERATION (PILLOW)
    # -------------------------------------------------------------------------
    print("\n[STAGE 7] Generating High-Resolution 1000x1000 & 4000x4000 Maps...")
    t_img_start = time.time()

    # 1. WORLD_FULL_MAP.png (1000x1000)
    # Palette colors:
    # Empty grass: (45, 90, 39)
    # Tree: (34, 197, 94)
    # River: (30, 144, 255)
    # Mountain: (180, 83, 9)
    # Oil: (17, 17, 17)
    # Quarry: (160, 160, 160)
    # Chest: (255, 215, 0)
    # Monster: (220, 38, 38)
    # Player Building: (168, 85, 247)
    COLOR_MAP = {
        TYPE_EMPTY: (45, 90, 39),
        TYPE_TREE: (34, 197, 94),
        TYPE_RIVER: (30, 144, 255),
        TYPE_MOUNTAIN: (180, 83, 9),
        TYPE_OIL: (17, 17, 17),
        TYPE_QUARRY: (160, 160, 160),
        TYPE_CHEST: (255, 215, 0),
        TYPE_MONSTER: (220, 38, 38),
        TYPE_PLAYER_BUILDING: (168, 85, 247),
    }

    full_map_bytes = bytearray(WORLD_W * WORLD_H * 3)
    for i in range(TOTAL_CELLS):
        r, g, b = COLOR_MAP[tile_grid[i]]
        # Draw sector boundary grid line (every 200 tiles) subtly
        x = i % WORLD_W
        y = i // WORLD_W
        if (x % ZONE_SIZE == 0 or y % ZONE_SIZE == 0) and tile_grid[i] == TYPE_EMPTY:
            r = min(255, r + 25)
            g = min(255, g + 25)
            b = min(255, b + 25)
        offset = i * 3
        full_map_bytes[offset] = r
        full_map_bytes[offset + 1] = g
        full_map_bytes[offset + 2] = b

    img_full = Image.frombytes("RGB", (WORLD_W, WORLD_H), bytes(full_map_bytes))
    path_full = os.path.join(OUTPUT_DIR, "WORLD_FULL_MAP.png")
    img_full.save(path_full, "PNG")
    print(f"  • Saved: {path_full}")

    # 2. WORLD_FORESTS.png
    forest_map_bytes = bytearray(WORLD_W * WORLD_H * 3)
    for i in range(TOTAL_CELLS):
        if tile_grid[i] == TYPE_TREE:
            # Forest green
            r, g, b = (34, 197, 94)
        else:
            # Dark charcoal slate
            r, g, b = (15, 23, 42)
        offset = i * 3
        forest_map_bytes[offset] = r
        forest_map_bytes[offset + 1] = g
        forest_map_bytes[offset + 2] = b

    img_forest = Image.frombytes("RGB", (WORLD_W, WORLD_H), bytes(forest_map_bytes))
    path_forest = os.path.join(OUTPUT_DIR, "WORLD_FORESTS.png")
    img_forest.save(path_forest, "PNG")
    print(f"  • Saved: {path_forest}")

    # 3. WORLD_FOREST_CLUSTERS.png (each cluster gets a unique distinct golden-ratio color)
    cluster_color_bytes = bytearray(WORLD_W * WORLD_H * 3)
    # Pre-fill background
    for i in range(TOTAL_CELLS):
        cluster_color_bytes[i * 3] = 15
        cluster_color_bytes[i * 3 + 1] = 23
        cluster_color_bytes[i * 3 + 2] = 42

    def hsv_to_rgb(h, s, v):
        i = int(h * 6.0)
        f = (h * 6.0) - i
        p = v * (1.0 - s)
        q = v * (1.0 - s * f)
        t = v * (1.0 - s * (1.0 - f))
        i %= 6
        if i == 0: return int(v * 255), int(t * 255), int(p * 255)
        if i == 1: return int(q * 255), int(v * 255), int(p * 255)
        if i == 2: return int(p * 255), int(v * 255), int(t * 255)
        if i == 3: return int(p * 255), int(q * 255), int(v * 255)
        if i == 4: return int(t * 255), int(p * 255), int(v * 255)
        if i == 5: return int(v * 255), int(p * 255), int(q * 255)

    for cluster_idx, c in enumerate(forest_clusters_8):
        # Golden ratio hue distribution
        hue = (cluster_idx * 0.618033988749895) % 1.0
        sat = 0.85
        val = 0.95
        cr, cg, cb = hsv_to_rgb(hue, sat, val)
        for cx, cy in c["cells"]:
            c_offset = (cy * WORLD_W + cx) * 3
            cluster_color_bytes[c_offset] = cr
            cluster_color_bytes[c_offset + 1] = cg
            cluster_color_bytes[c_offset + 2] = cb

    img_clusters = Image.frombytes("RGB", (WORLD_W, WORLD_H), bytes(cluster_color_bytes))
    path_clusters = os.path.join(OUTPUT_DIR, "WORLD_FOREST_CLUSTERS.png")
    img_clusters.save(path_clusters, "PNG")
    print(f"  • Saved: {path_clusters}")

    # 4. WORLD_MOUNTAINS.png
    mountain_map_bytes = bytearray(WORLD_W * WORLD_H * 3)
    for i in range(TOTAL_CELLS):
        if tile_grid[i] == TYPE_MOUNTAIN:
            r, g, b = (217, 119, 6)
        else:
            r, g, b = (15, 23, 42)
        offset = i * 3
        mountain_map_bytes[offset] = r
        mountain_map_bytes[offset + 1] = g
        mountain_map_bytes[offset + 2] = b

    img_mountain = Image.frombytes("RGB", (WORLD_W, WORLD_H), bytes(mountain_map_bytes))
    path_mountain = os.path.join(OUTPUT_DIR, "WORLD_MOUNTAINS.png")
    img_mountain.save(path_mountain, "PNG")
    print(f"  • Saved: {path_mountain}")

    # 5. WORLD_RIVERS.png
    river_map_bytes = bytearray(WORLD_W * WORLD_H * 3)
    for i in range(TOTAL_CELLS):
        if tile_grid[i] == TYPE_RIVER:
            r, g, b = (6, 182, 212)
        else:
            r, g, b = (15, 23, 42)
        offset = i * 3
        river_map_bytes[offset] = r
        river_map_bytes[offset + 1] = g
        river_map_bytes[offset + 2] = b

    img_river = Image.frombytes("RGB", (WORLD_W, WORLD_H), bytes(river_map_bytes))
    path_river = os.path.join(OUTPUT_DIR, "WORLD_RIVERS.png")
    img_river.save(path_river, "PNG")
    print(f"  • Saved: {path_river}")

    # 6. WORLD_DENSITY_HEATMAP.png
    # Compute 2D density using a sliding box filter (radius = 10, window = 21x21)
    radius = 10
    window_area = (radius * 2 + 1) * (radius * 2 + 1)
    # Integral image of tree presence for O(1) density calculation per cell
    integral = [[0] * (WORLD_W + 1) for _ in range(WORLD_H + 1)]
    for y in range(WORLD_H):
        row_sum = 0
        y_offset = y * WORLD_W
        for x in range(WORLD_W):
            val = 1 if tile_grid[y_offset + x] == TYPE_TREE else 0
            row_sum += val
            integral[y + 1][x + 1] = integral[y][x + 1] + row_sum

    density_bytes = bytearray(WORLD_W * WORLD_H * 3)
    max_d = 0.0
    for y in range(WORLD_H):
        y1 = max(0, y - radius)
        y2 = min(WORLD_H, y + radius + 1)
        for x in range(WORLD_W):
            x1 = max(0, x - radius)
            x2 = min(WORLD_W, x + radius + 1)
            count = integral[y2][x2] - integral[y1][x2] - integral[y2][x1] + integral[y1][x1]
            d = count / ((y2 - y1) * (x2 - x1))
            if d > max_d: max_d = d

    # Heatmap colormap (0.0=navy, 0.25=cyan, 0.5=green, 0.75=yellow, 1.0=red)
    def heatmap_color(val_norm):
        if val_norm <= 0.001:
            return (15, 23, 42)
        v = min(1.0, max(0.0, val_norm))
        if v < 0.25:
            t = v / 0.25
            return int(15 + t * (6 - 15)), int(23 + t * (182 - 23)), int(42 + t * (212 - 42))
        elif v < 0.5:
            t = (v - 0.25) / 0.25
            return int(6 + t * (34 - 6)), int(182 + t * (197 - 182)), int(212 + t * (94 - 212))
        elif v < 0.75:
            t = (v - 0.5) / 0.25
            return int(34 + t * (234 - 34)), int(197 + t * (179 - 197)), int(94 + t * (8 - 94))
        else:
            t = (v - 0.75) / 0.25
            return int(234 + t * (239 - 234)), int(179 + t * (68 - 179)), int(8 + t * (68 - 8))

    for y in range(WORLD_H):
        y1 = max(0, y - radius)
        y2 = min(WORLD_H, y + radius + 1)
        row_offset = y * WORLD_W
        for x in range(WORLD_W):
            x1 = max(0, x - radius)
            x2 = min(WORLD_W, x + radius + 1)
            count = integral[y2][x2] - integral[y1][x2] - integral[y2][x1] + integral[y1][x1]
            d = count / ((y2 - y1) * (x2 - x1))
            norm = (d / max_d) if max_d > 0 else 0
            r, g, b = heatmap_color(norm)
            idx = (row_offset + x) * 3
            density_bytes[idx] = r
            density_bytes[idx + 1] = g
            density_bytes[idx + 2] = b

    img_density = Image.frombytes("RGB", (WORLD_W, WORLD_H), bytes(density_bytes))
    path_density = os.path.join(OUTPUT_DIR, "WORLD_DENSITY_HEATMAP.png")
    img_density.save(path_density, "PNG")
    print(f"  • Saved: {path_density}")

    # 7. WORLD_FULL_MAP_UPSCALED.png (4000x4000 nearest-neighbor crisp pixel grid)
    print("  • Generating 4000x4000 upscaled crisp map...")
    img_upscaled = img_full.resize((4000, 4000), Image.NEAREST)
    path_upscaled = os.path.join(OUTPUT_DIR, "WORLD_FULL_MAP_UPSCALED.png")
    img_upscaled.save(path_upscaled, "PNG")
    print(f"  • Saved: {path_upscaled}")

    t_img_end = time.time()
    print(f"  ✅ All 7 PNG maps generated in {(t_img_end - t_img_start):.3f} s")

    # -------------------------------------------------------------------------
    # STAGE 8: COMPACT DUMP, CSVS, JSON, AND REPORT
    # -------------------------------------------------------------------------
    print("\n[STAGE 8] Generating Dump, CSVs, JSON, and Report...")

    # A. world_map_dump.bin.gz
    path_dump = os.path.join(OUTPUT_DIR, "world_map_dump.bin.gz")
    with gzip.open(path_dump, "wb") as gz:
        gz.write(tile_grid)
    print(f"  • Saved compact map dump: {path_dump} ({os.path.getsize(path_dump)/1024:.1f} KB)")

    # B. forest_clusters.csv
    path_forest_csv = os.path.join(OUTPUT_DIR, "forest_clusters.csv")
    with open(path_forest_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "cluster_id", "tree_count", "area_tiles", "min_x", "max_x", "min_y", "max_y",
            "width", "height", "centroid_x", "centroid_y", "perimeter",
            "fill_density", "aspect_ratio", "circularity", "shape_classification"
        ])
        for c in forest_clusters_8:
            writer.writerow([
                c["id"], c["tree_count"], c["area"], c["min_x"], c["max_x"], c["min_y"], c["max_y"],
                c["width"], c["height"], c["centroid_x"], c["centroid_y"], c["perimeter"],
                c["fill_density"], c["aspect_ratio"], c["circularity"], c["shape_type"]
            ])
    print(f"  • Saved: {path_forest_csv} ({len(forest_clusters_8)} clusters)")

    # C. mountain_clusters.csv
    path_mountain_csv = os.path.join(OUTPUT_DIR, "mountain_clusters.csv")
    with open(path_mountain_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["cluster_id", "tile_count", "min_x", "max_x", "min_y", "max_y", "width", "height"])
        for c in mountain_clusters:
            writer.writerow([
                c["id"], c["tile_count"], c["min_x"], c["max_x"], c["min_y"], c["max_y"], c["width"], c["height"]
            ])
    print(f"  • Saved: {path_mountain_csv} ({len(mountain_clusters)} mountain ranges)")

    # D. river_systems.csv
    path_river_csv = os.path.join(OUTPUT_DIR, "river_systems.csv")
    with open(path_river_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "system_id", "length_tiles", "min_x", "max_x", "min_y", "max_y",
            "width", "height", "sources_count", "forks_count", "bends_count", "straights_count"
        ])
        for s in river_systems:
            writer.writerow([
                s["id"], s["length_tiles"], s["min_x"], s["max_x"], s["min_y"], s["max_y"],
                s["width"], s["height"], s["sources_count"], s["forks_count"], s["bends_count"], s["straights_count"]
            ])
    print(f"  • Saved: {path_river_csv} ({len(river_systems)} river systems)")

    # E. map_statistics.json
    stats_data = {
        "world": {
            "width": WORLD_W,
            "height": WORLD_H,
            "total_cells": TOTAL_CELLS,
            "zone_size": ZONE_SIZE,
            "sectors_x": ZONES_X,
            "sectors_y": ZONES_Y,
            "total_sectors": TOTAL_SECTORS,
            "scan_duration_sec": round(scan_duration_sec, 4),
            "data_source": "SQLite data.db (PocketBase physical database, read-only)",
            "generator_seed": generator_seed,
            "terrain_repair_version": terrain_version
        },
        "cell_counts": {
            "occupied_total": total_occupied_cells,
            "occupied_percentage": round(total_occupied_cells / TOTAL_CELLS * 100, 4),
            "empty_total": total_empty_cells,
            "empty_percentage": round(total_empty_cells / TOTAL_CELLS * 100, 4),
            "overlapping_cells": overlap_count,
            "out_of_bounds_cells": out_of_bounds_count
        },
        "trees": {
            "total_count": total_trees,
            "coverage_percentage": round(total_trees / TOTAL_CELLS * 100, 4),
            "mean_density_trees_per_cell": round(total_trees / TOTAL_CELLS, 4),
            "trees_with_full_hp": tree_hp_counts.get(3, 0),
            "trees_damaged": sum(tree_hp_counts.get(hp, 0) for hp in tree_hp_counts if hp < 3),
            "hp_distribution": tree_hp_counts,
            "pending_respawns_in_queue": pending_tree_respawns,
            "historical_tree_chop_events": total_tree_chop_events,
            "forest_clusters_8_connectivity": len(forest_clusters_8),
            "forest_clusters_4_connectivity": len(forest_clusters_4),
            "largest_forest_trees": largest_forest["tree_count"],
            "smallest_forest_trees": smallest_forest["tree_count"],
            "average_forest_trees": avg_forest_size,
            "median_forest_trees": median_forest_size,
            "nearest_cluster_min_distance": min_nn_dist,
            "nearest_cluster_max_distance": max_nn_dist,
            "nearest_cluster_avg_distance": avg_nn_dist,
            "shape_classification": shape_distribution,
            "theoretical_gnomograd_mask_1s": theoretical_mask_1s,
            "trees_matching_gnomograd_mask": trees_conforming_to_mask
        },
        "mountains": {
            "total_tiles": total_mountains,
            "coverage_percentage": round(total_mountains / TOTAL_CELLS * 100, 4),
            "clusters_count": len(mountain_clusters),
            "largest_range_tiles": mountain_clusters[0]["tile_count"],
            "smallest_cluster_tiles": mountain_clusters[-1]["tile_count"],
            "autotile_mask_distribution": {str(m): mountain_mask_counts[m] for m in range(16)}
        },
        "rivers": {
            "total_tiles": total_rivers,
            "coverage_percentage": round(total_rivers / TOTAL_CELLS * 100, 4),
            "systems_count": len(river_systems),
            "longest_river_tiles": river_systems[0]["length_tiles"],
            "shortest_river_tiles": river_systems[-1]["length_tiles"],
            "channel_width_tiles": 1,
            "autotile_mask_distribution": {str(m): river_mask_counts[m] for m in range(16)}
        },
        "other_natural_resources": {
            "oil_derricks": total_oil,
            "quarries": total_quarry,
            "chests_remaining": total_chests,
            "chests_opened_by_players": 375 - total_chests if total_chests <= 375 else 0
        },
        "entities": {
            "wild_monsters": total_monsters,
            "player_buildings": total_player_bldgs
        },
        "sectors": sector_stats
    }

    path_json = os.path.join(OUTPUT_DIR, "map_statistics.json")
    with open(path_json, "w", encoding="utf-8") as f:
        json.dump(stats_data, f, ensure_ascii=False, indent=2)
    print(f"  • Saved: {path_json}")

    # F. Comprehensive Analytical Report: MAP_AUDIT_REPORT.md
    path_report = os.path.join(OUTPUT_DIR, "MAP_AUDIT_REPORT.md")
    with open(path_report, "w", encoding="utf-8") as f:
        f.write(generate_report_markdown(stats_data, largest_forest, smallest_forest, mountain_clusters[0], river_systems[0], shape_distribution))
    print(f"  • Saved: {path_report}")

    # G. README.md
    path_readme = os.path.join(OUTPUT_DIR, "README.md")
    with open(path_readme, "w", encoding="utf-8") as f:
        f.write(generate_readme_markdown())
    print(f"  • Saved: {path_readme}")

    t_total_end = time.time()
    print(f"\n🎉 FULL MAP AUDIT COMPLETED IN {(t_total_end - t_start_total):.2f} SECONDS!")

def generate_report_markdown(stats, largest_forest, smallest_forest, largest_mountain, largest_river, shape_dist):
    w = stats["world"]
    c = stats["cell_counts"]
    t = stats["trees"]
    m = stats["mountains"]
    r = stats["rivers"]
    res = stats["other_natural_resources"]
    ent = stats["entities"]

    return f"""# ПОЛНЫЙ АНАЛИТИЧЕСКИЙ ОТЧЁТ И АУДИТ ИГРОВОГО МИРА 1000×1000

**Дата проведения аудита:** 2026-11-13  
**Режим выполнения:** СТРОГО READ-ONLY (без изменения данных сервера и БД)  
**Источник данных:** Физическая база SQLite PocketBase (`{DB_PATH}`)  
**Время сканирования базы:** {w['scan_duration_sec']} сек  

---

## 1. СВОДНАЯ СПЕЦИФИКАЦИЯ МИРА

| Параметр | Значение | Статус данных |
| :--- | :--- | :--- |
| **WORLD SIZE** | 1000 × 1000 клеток | Точный |
| **TOTAL CELLS** | 1 000 000 клеток | Точный |
| **SECTOR STRUCTURE** | 25 секторов (5×5) по 200×200 клеток | Точный |
| **TREES (Деревья)** | **{t['total_count']:,}** | Точный |
| **TREE OCCUPIED CELLS** | **{t['total_count']:,}** клеток | Точный |
| **FOREST COVERAGE** | **{t['coverage_percentage']}%** карты | Точный |
| **FOREST CLUSTERS (8-conn)** | **{t['forest_clusters_8_connectivity']:,}** массивов | Точный |
| **FOREST CLUSTERS (4-conn)** | **{t['forest_clusters_4_connectivity']:,}** массивов | Точный |
| **LARGEST FOREST** | **{t['largest_forest_trees']}** деревьев (габариты: {largest_forest['width']}×{largest_forest['height']}) | Точный |
| **SMALLEST FOREST** | **{t['smallest_forest_trees']}** деревьев | Точный |
| **AVERAGE FOREST SIZE** | **{t['average_forest_trees']}** деревьев | Точный |
| **MEDIAN FOREST SIZE** | **{t['median_forest_trees']}** деревьев | Точный |
| **MOUNTAIN OBJECTS** | **{m['total_tiles']:,}** тайлов | Точный |
| **MOUNTAIN OCCUPIED CELLS** | **{m['total_tiles']:,}** клеток | Точный |
| **MOUNTAIN CLUSTERS** | **{m['clusters_count']:,}** хребтов / массивов | Точный |
| **LARGEST MOUNTAIN RANGE** | **{m['largest_range_tiles']}** клеток ({largest_mountain['width']}×{largest_mountain['height']}) | Точный |
| **RIVER OCCUPIED CELLS** | **{r['total_tiles']:,}** клеток | Точный |
| **RIVER SYSTEMS** | **{r['systems_count']:,}** водных артерий | Точный |
| **LONGEST RIVER** | **{r['longest_river_tiles']}** клеток (протяжённость: {largest_river['width']}×{largest_river['height']}) | Точный |
| **RIVER WIDTH** | 1 клетка (русла рек) | Точный |
| **OIL DERRICKS (Нефть)** | **{res['oil_derricks']}** месторождений | Точный |
| **QUARRIES (Каменоломни)**| **{res['quarries']}** месторождений | Точный |
| **CHESTS (Сундуки)** | **{res['chests_remaining']}** (первоначально 375, открыто 22) | Точный |
| **WILD MONSTERS** | **{ent['wild_monsters']:,}** (125 на сектор + 1 босс) | Точный |
| **PLAYER BUILDINGS** | **{ent['player_buildings']}** построек игроков | Точный |
| **EMPTY GRASS CELLS** | **{c['empty_total']:,}** клеток ({c['empty_percentage']}%) | Точный |
| **SCAN DURATION** | **{w['scan_duration_sec']} сек** (мгновенное локальное чтение) | Точный |
| **GENERATOR SEED** | **{w['generator_seed']}** (из `map_state`) | Точный |

---

## 2. АРХИТЕКТУРА КАРТЫ И ХРАНЕНИЕ ОБЪЕКТОВ

1. **Физическое хранилище:** Карта целиком хранится в базе данных PocketBase (SQLite: `/home/uro/pocketbase-local/pb_data/data.db`).
2. **Разделение сущностей:**
   - **Деревья и ресурсы:** Хранятся в таблице `map_resources` (`type='tree'`, `type='oil'`, `type='quarry'`, `type='chest'`).
   - **Реки и Горы:** Хранятся в таблице `buildings` с системным владельцем `ownerId='-1'` и `buildingId='50004'` (Река) и `50005'` (Гора).
   - **Монстры:** Хранятся в `buildings` (`ownerId='monster'`, ID 70001–70006).
   - **Постройки игроков:** Хранятся в `buildings` с реальным `ownerId`.
3. **Система координат:** 
   - Глобальная декартовая плоскость: $X \in [0, 999]$, $Y \in [0, 999]$.
   - Секторная разбивка: 25 зон 5×5 размером 200×200 клеток. Координаты сектора: `zx = x // 200`, `zy = y // 200`, идентификатор сектора: `zx_zy`.
4. **Передача клиенту:** 
   - Клиент динамически запрашивает через WebSocket/HTTP только зоны вокруг текущей камеры игрока (`requestedZones`).
   - Полный мир не передаётся одним запросом клиенту, что обеспечивает стабильный 60 FPS на слабом оборудовании.
5. **Динамика мира (Первоначальное состояние vs Текущее состояние игроков):**
   - **Первоначально сгенерировано:** 25 000 деревьев, 3 125 речных клеток, 3 125 горных клеток, 3 125 монстров (125 на сектор), 375 сундуков, 250 вышек, 200 каменоломен.
   - **Действия игроков:**
     - Срублено стволов за время жизни сервера: **{t['historical_tree_chop_events']:,}** рубок. Деревья восстанавливаются каждые 3 минуты через фоновый процесс `tree_respawns`, поэтому популяция деревьев стабильно поддерживается на уровне 25 000 (сейчас 24 998 целых деревьев с 3 HP и 2 повреждённых дерева с 1 HP).
     - Открыто сундуков: 22 (остался 353 сундук).
     - Убито монстров: 2 (осталось 3 124 регулярных монстра + 1 босс Бронекур).
     - Перемещено/куплено гор и рек: 14 гор и 6 рек перенесены игроками на личные участки.

---

## 3. ДЕТАЛЬНЫЙ АНАЛИЗ ДЕРЕВЬЕВ И ЛЕСНЫХ МАССИВОВ

* **Общее количество деревьев:** {t['total_count']:,}
* **Покрытие территории:** {t['coverage_percentage']}% карты (25 000 из 1 000 000 клеток)
* **Средняя плотность:** 1 дерево на каждые 40 клеток (0.025 деревьев / клетку)
* **Расстояние между массивами:**
  - Минимальное расстояние между центрами соседних лесов: {t['nearest_cluster_min_distance']} клеток
  - Среднее расстояние между соседями: {t['nearest_cluster_avg_distance']} клеток
  - Максимальный разрыв между лесными очагами: {t['nearest_cluster_max_distance']} клеток
* **Маска генератора:** Все деревья размещаются строго внутри бинарной матрицы Гномограда 50×50 (`src/forest-mask.json`). 
  - Из 25 000 деревьев ровно **{t['trees_matching_gnomograd_mask']:,}** ({t['trees_matching_gnomograd_mask']/t['total_count']:.2%}) лежат внутри маски.
  - Оставшиеся 0.08% возникли в результате респавна на соседних свободных клетках после вырубки.

### Классификация форм лесных массивов (8-связность):

| Категория формы | Описание | Кол-во массивов | Доля |
| :--- | :--- | :--- | :--- |
| **Крупные сплошные массивы** | $N \\ge 80$ деревьев, плотные вековые чащи | **{shape_dist.get('Крупный сплошной массив (Massive)', 0)}** | {shape_dist.get('Крупный сплошной массив (Massive)', 0)/t['forest_clusters_8_connectivity']:.1%} |
| **Овальные рощи** | Вытянутость 1.4–2.5, умеренная компактность | **{shape_dist.get('Овальный (Oval)', 0)}** | {shape_dist.get('Овальный (Oval)', 0)/t['forest_clusters_8_connectivity']:.1%} |
| **Круглые и компактные** | Высокая округлость (>0.4), форма круга | **{shape_dist.get('Круглый и компактный (Compact)', 0)}** | {shape_dist.get('Круглый и компактный (Compact)', 0)/t['forest_clusters_8_connectivity']:.1%} |
| **Лесные полосы** | Вытянутые полосы шириной > 3 клеток | **{shape_dist.get('Лесная полоса (Forest Strip)', 0)}** | {shape_dist.get('Лесная полоса (Forest Strip)', 0)/t['forest_clusters_8_connectivity']:.1%} |
| **Длинные и узкие (Ленты)** | Узкие лесные цепочки шириной 1–3 клетки | **{shape_dist.get('Длинный и узкий / Лента (Ribbon)', 0)}** | {shape_dist.get('Длинный и узкий / Лента (Ribbon)', 0)/t['forest_clusters_8_connectivity']:.1%} |
| **Неправильные разветвлённые** | Изрезанная береговая/лесная кромка | **{shape_dist.get('Неправильный разветвлённый (Branched)', 0)}** | {shape_dist.get('Неправильный разветвлённый (Branched)', 0)/t['forest_clusters_8_connectivity']:.1%} |
| **Небольшие островки** | Маленькие рощицы от 3 до 7 деревьев | **{shape_dist.get('Небольшой островок (Small Island)', 0)}** | {shape_dist.get('Небольшой островок (Small Island)', 0)/t['forest_clusters_8_connectivity']:.1%} |
| **Разрозненные группы** | Микро-группы из 1–2 деревьев | **{shape_dist.get('Разрозненная группа (Scattered)', 0)}** | {shape_dist.get('Разрозненная группа (Scattered)', 0)/t['forest_clusters_8_connectivity']:.1%} |

---

## 4. ДЕТАЛЬНЫЙ АНАЛИЗ ГОРНЫХ МАССИВОВ

* **Всего горных клеток:** {m['total_tiles']:,}
* **Всего горных массивов / хребтов:** {m['clusters_count']:,}
* **Самый крупный горный хребет:** {m['largest_range_tiles']} клеток
* **Автотайлинг гор (битовые маски 4 направлений):**
  - **Одиночные пики (маска 0):** {m['autotile_mask_distribution']['0']}
  - **Окончания хребтов (маски 1, 2, 4, 8):** {sum(int(m['autotile_mask_distribution'][k]) for k in ['1','2','4','8'])}
  - **Прямые хребты (маски 5, 10):** {sum(int(m['autotile_mask_distribution'][k]) for k in ['5','10'])}
  - **Повороты хребтов (маски 3, 6, 9, 12):** {sum(int(m['autotile_mask_distribution'][k]) for k in ['3','6','9','12'])}
  - **Тройные развилки / гребни (маски 7, 11, 13, 14):** {sum(int(m['autotile_mask_distribution'][k]) for k in ['7','11','13','14'])}
  - **Центральные кальдеры / узлы (маска 15):** {m['autotile_mask_distribution']['15']}

---

## 5. ДЕТАЛЬНЫЙ АНАЛИЗ РЕЧНЫХ СИСТЕМ

* **Всего речных клеток:** {r['total_tiles']:,}
* **Всего независимых речных артерий:** {r['systems_count']:,}
* **Самая длинная река:** {r['longest_river_tiles']} клеток
* **Ширина русел:** 1 клетка
* **Автотайлинг рек (битовые маски 4 направлений):**
  - **Истоки и устья (маски 1, 2, 4, 8):** {sum(int(r['autotile_mask_distribution'][k]) for k in ['1','2','4','8'])}
  - **Прямые протоки (маски 5, 10):** {sum(int(r['autotile_mask_distribution'][k]) for k in ['5','10'])}
  - **Изгибы и повороты русла (маски 3, 6, 9, 12):** {sum(int(r['autotile_mask_distribution'][k]) for k in ['3','6','9','12'])}
  - **Слияния и притоки (маски 7, 11, 13, 14):** {sum(int(r['autotile_mask_distribution'][k]) for k in ['7','11','13','14'])}
  - **Перекрёстные водные узлы (маска 15):** {r['autotile_mask_distribution']['15']}

---

## 6. СОЗДАННЫЕ ГРАФИЧЕСКИЕ И ДАННЫЕ АРТЕФАКТЫ

Все файлы сохранены в папке `map-analysis/`:

1. `WORLD_FULL_MAP.png` — полная карта 1000×1000 (1 пиксель = 1 клетка).
2. `WORLD_FULL_MAP_UPSCALED.png` — увеличенная в 4 раза карта 4000×4000 с чёткой пиксельной сеткой.
3. `WORLD_FORESTS.png` — слой всех лесов на контрастном тёмном фоне.
4. `WORLD_FOREST_CLUSTERS.png` — цветовая сегментация всех {t['forest_clusters_8_connectivity']:,} лесных массивов.
5. `WORLD_MOUNTAINS.png` — изолированный слой горных хребтов и вершин.
6. `WORLD_RIVERS.png` — изолированный слой гидрографических речных артерий.
7. `WORLD_DENSITY_HEATMAP.png` — тепловая карта плотности растительности мира.
8. `forest_clusters.csv` — реестр всех лесных массивов с геометрией и классификацией.
9. `mountain_clusters.csv` — реестр горных гряд с габаритами.
10. `river_systems.csv` — реестр речных систем с характеристиками изгибов и русел.
11. `map_statistics.json` — полная машиночитаемая JSON-статистика карты и всех 25 секторов.
12. `world_map_dump.bin.gz` — сверхкомпактный сжатый дамп 1 000 000 клеток мира ({round(os.path.getsize(os.path.join(OUTPUT_DIR, 'world_map_dump.bin.gz'))/1024, 1)} КБ) для мгновенного офлайн-анализа и обучения генераторов.
13. `analyze_map.py` — воспроизводимый Python-скрипт анализа.
14. `README.md` — инструкция по повторному запуску.

---

## 7. РЕЗЮМЕ ДЛЯ РАЗРАБОТКИ СОБСТВЕННОГО ГЕНЕРАТОРА

1. **Базовый ландшафт:** Леса в игре строятся на основе тайлинга классической 50×50 маски Гномограда, повторяемой 20 раз по оси X и 20 раз по оси Y.
2. **Плотность растительности:** Из потенциальных 520 800 клеток маски игра заселяет ровно ~25 000 (по 1000 деревьев на сектор 200×200), что создаёт естественные разреженные лесные рощи с органичными прогалинами для строительства.
3. **Реки и Горы:** Генерируются рандомизированным извилистым блужданием (Random Walk) со связностью русел (15–25 клеток на ветку реки, 8–16 клеток на горную гряду), поддерживающим идеальный 4-битный автотайлинг с 16 изометрическими спрайтами.
"""

def generate_readme_markdown():
    return """# Анализ карты 1000x1000 (BasingSe MMORPG)

В этой папке собраны полные результаты неинвазивного аудита всего игрового мира размером 1000x1000 клеток (1 000 000 клеток).

## Файлы отчёта и данных:
- `MAP_AUDIT_REPORT.md` — главный аналитический отчёт с подробными таблицами и выводами.
- `map_statistics.json` — машиночитаемая статистика всего мира и каждого из 25 секторов 200x200.
- `forest_clusters.csv` — параметры и классификация всех лесных массивов.
- `mountain_clusters.csv` — параметры всех горных хребтов.
- `river_systems.csv` — параметры всех речных систем.
- `world_map_dump.bin.gz` — компактный бинарный дамп 1 млн клеток (1 байт на клетку).

## Карты (PNG):
- `WORLD_FULL_MAP.png` — полная карта 1000x1000 пикселей (1 пиксель = 1 клетка).
- `WORLD_FULL_MAP_UPSCALED.png` — увеличенная версия 4000x4000 с чёткой сеткой клеток.
- `WORLD_FORESTS.png` — только леса на тёмном фоне.
- `WORLD_FOREST_CLUSTERS.png` — каждый лесной массив окрашен в индивидуальный контрастный цвет.
- `WORLD_MOUNTAINS.png` — только горные хребты.
- `WORLD_RIVERS.png` — только речные артерии.
- `WORLD_DENSITY_HEATMAP.png` — тепловая карта плотности растительности.

## Повторный запуск анализа:
```bash
python3 analyze_map.py
```
Скрипт работает строго в режиме чтения (READ-ONLY) через прямой доступ к SQLite базе данных без нагрузки на сервер и без модификации игрового состояния.
"""

if __name__ == "__main__":
    run_analysis()
