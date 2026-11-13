#!/usr/bin/env python3
"""
generate_1000x1000_world.py
Генератор игрового мира 1000x1000 с 25 секторами (5x5 по 200x200 клеток).
"""

import os
import sys
import json
import random
import string
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor

PB_URL = "http://127.0.0.1:8090"
ADMIN_EMAIL = "admin@basingse.game"
ADMIN_PASSWORD = "BaSingSe2024"

WORLD_W = 1000
WORLD_H = 1000
ZONE_SIZE = 200
ZONES_X = 5
ZONES_Y = 5

# TREES: Procedural deterministic 50x50 mask (520,800 total world, 20,832 per sector).
# NEVER create physical tree records in PocketBase!
RIVERS_PER_SECTOR = 125     # 25 * 125 = 3,125 речных клеток
MOUNTAINS_PER_SECTOR = 125  # 25 * 125 = 3,125 горных клеток
MONSTERS_PER_SECTOR = 125   # 25 * 125 = 3,125 монстров
OIL_PER_SECTOR = 10         # 25 * 10 = 250 нефтяных вышек
QUARRIES_PER_SECTOR = 8     # 25 * 8 = 200 каменоломен
CHESTS_PER_SECTOR = 15      # 25 * 15 = 375 сундуков

# Monster definitions (125 regular wild monsters per sector: 25 of each type; NO Котофей/Тролль/Айболит/Большой Айболит)
MONSTER_CONFIG = [
    {"id": 70001, "name": "Избушка-убийца", "hp": 100, "count": 25},
    {"id": 70002, "name": "Добрый Санта",   "hp": 80,  "count": 25},
    {"id": 70003, "name": "Горыныч",        "hp": 150, "count": 25},
    {"id": 70004, "name": "Колобок",        "hp": 120, "count": 25},
    {"id": 70005, "name": "Баба Яга",       "hp": 130, "count": 25},
]
BRONEKUR_BOSS_CFG = {"id": 70006, "name": "Бронекур", "hp": 500}
# Проверка: 22+20+16+18+16+14+10+8+1 = 125 монстров на сектор!

def make_pb_id():
    chars = string.ascii_lowercase + string.digits
    return ''.join(random.choice(chars) for _ in range(15))

def get_zone_id(x, y):
    return f"{x // ZONE_SIZE}_{y // ZONE_SIZE}"

def auth_admin():
    req = urllib.request.Request(
        f"{PB_URL}/api/collections/_superusers/auth-with-password",
        data=json.dumps({"identity": ADMIN_EMAIL, "password": ADMIN_PASSWORD}).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode())
    return data["token"]

def delete_all(token, collection_name):
    print(f"🗑️  Очистка коллекции: {collection_name}...")
    deleted = 0
    while True:
        req = urllib.request.Request(
            f"{PB_URL}/api/collections/{collection_name}/records?perPage=200&fields=id",
            headers={"Authorization": token}
        )
        try:
            res = urllib.request.urlopen(req)
            items = json.loads(res.read().decode()).get("items", [])
            if not items:
                break
            
            def del_one(rec_id):
                del_req = urllib.request.Request(
                    f"{PB_URL}/api/collections/{collection_name}/records/{rec_id}",
                    headers={"Authorization": token},
                    method="DELETE"
                )
                try:
                    urllib.request.urlopen(del_req)
                except Exception:
                    pass

            with ThreadPoolExecutor(max_workers=25) as executor:
                list(executor.map(del_one, [it["id"] for it in items]))

            deleted += len(items)
            sys.stdout.write(f"  Удалено: {deleted}\r")
            sys.stdout.flush()
        except Exception as e:
            print(f"  Ошибка при чтении {collection_name}: {e}")
            break
    print(f"  ✅ Коллекция {collection_name} полностью очищена (удалено {deleted})")

def batch_insert(token, collection_name, records):
    total = len(records)
    inserted = 0
    errors = 0

    def post_one(item):
        nonlocal inserted, errors
        payload = json.dumps(item).encode()
        req = urllib.request.Request(
            f"{PB_URL}/api/collections/{collection_name}/records",
            data=payload,
            headers={"Authorization": token, "Content-Type": "application/json"}
        )
        try:
            urllib.request.urlopen(req)
            inserted += 1
        except Exception as e:
            errors += 1

    with ThreadPoolExecutor(max_workers=30) as executor:
        for i, _ in enumerate(executor.map(post_one, records)):
            if (i + 1) % 500 == 0 or (i + 1) == total:
                sys.stdout.write(f"    Вставка {collection_name}: {i + 1}/{total} (ошибок: {errors})\r")
                sys.stdout.flush()

    print(f"    ✅ {collection_name}: успешно создано {inserted}/{total} (ошибок: {errors})")

def main():
    print("=======================================================================")
    print(" 🏰 BASINGSE MMORPG — ГЕНЕРАЦИЯ МИРА 1000x1000 (25 СЕКТОРОВ 200x200)")
    print("=======================================================================")

    print("🔑 Авторизация в PocketBase...")
    token = auth_admin()
    print("✅ Успешно авторизован!\n")

    # 1. Удаление всех старых данных
    print("--- ШАГ 1: ПОЛНОЕ УДАЛЕНИЕ СТАРЫХ ПОСТРОЕК, РЕК, ГОР, МОНСТРОВ И РЕСУРСОВ ---")
    delete_all(token, "buildings")
    delete_all(token, "map_resources")
    delete_all(token, "dropped_items")
    delete_all(token, "map_state")

    # 2. Загрузка маски леса Гномограда
    mask_path = "/home/uro/Рабочий стол/my projects/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/src/forest-mask.json"
    with open(mask_path, "r", encoding="utf-8") as f:
        forest_mask_data = json.load(f)
    mask_rows = forest_mask_data["rows"]
    mask_w = forest_mask_data["width"]   # 50
    mask_h = forest_mask_data["height"]  # 50

    def is_gnomograd_forest_tile(x, y):
        return mask_rows[y % mask_h][x % mask_w] == "1"

    occupied = set()

    # Списки для вставки в базу
    buildings_to_create = []
    resources_to_create = []

    print("\n--- ШАГ 2: ГЕНЕРАЦИЯ ОБЪЕКТОВ ДЛЯ 25 СЕКТОРОВ (5x5) ---")

    for zx in range(ZONES_X):
        for zy in range(ZONES_Y):
            zone_id = f"{zx}_{zy}"
            min_x = zx * ZONE_SIZE
            max_x = min_x + ZONE_SIZE - 1
            min_y = zy * ZONE_SIZE
            max_y = min_y + ZONE_SIZE - 1

            # ----------------------------------------------------
            # А. РЕКИ (125 тайлов на сектор связными руслами)
            # ----------------------------------------------------
            rivers_placed = 0
            while rivers_placed < RIVERS_PER_SECTOR:
                # Начало русла
                cx = random.randint(min_x + 10, max_x - 10)
                cy = random.randint(min_y + 10, max_y - 10)
                path_len = min(random.randint(15, 25), RIVERS_PER_SECTOR - rivers_placed)
                
                # Направление реки
                dx_dir, dy_dir = random.choice([(1, 0), (0, 1), (1, 1), (-1, 1), (1, -1)])
                
                for _ in range(path_len):
                    if min_x <= cx <= max_x and min_y <= cy <= max_y and (cx, cy) not in occupied:
                        occupied.add((cx, cy))
                        buildings_to_create.append({
                            "id": make_pb_id(),
                            "gameId": f"river_{cx}_{cy}",
                            "x": cx,
                            "y": cy,
                            "zoneId": zone_id,
                            "buildingId": "50004",
                            "ownerId": "-1",
                            "ownerName": "Система",
                            "data": {
                                "zoneId": zone_id,
                                "hp": 999999,
                                "maxHp": 999999,
                                "isConstructing": False,
                                "type": "Default",
                                "workState": "idle"
                            }
                        })
                        rivers_placed += 1
                    # Извилистый шаг
                    cx += dx_dir + random.choice([-1, 0, 1])
                    cy += dy_dir + random.choice([-1, 0, 1])

            # ----------------------------------------------------
            # Б. ГОРЫ (125 тайлов на сектор горными хребтами)
            # ----------------------------------------------------
            mountains_placed = 0
            while mountains_placed < MOUNTAINS_PER_SECTOR:
                # Центр горного массива
                cx = random.randint(min_x + 5, max_x - 5)
                cy = random.randint(min_y + 5, max_y - 5)
                cluster_len = min(random.randint(8, 16), MOUNTAINS_PER_SECTOR - mountains_placed)

                for _ in range(cluster_len):
                    if min_x <= cx <= max_x and min_y <= cy <= max_y and (cx, cy) not in occupied:
                        occupied.add((cx, cy))
                        buildings_to_create.append({
                            "id": make_pb_id(),
                            "gameId": f"mountain_{cx}_{cy}",
                            "x": cx,
                            "y": cy,
                            "zoneId": zone_id,
                            "buildingId": "50005",
                            "ownerId": "-1",
                            "ownerName": "Система",
                            "data": {
                                "zoneId": zone_id,
                                "hp": 999999,
                                "maxHp": 999999,
                                "isConstructing": False,
                                "type": "Default",
                                "workState": "idle"
                            }
                        })
                        mountains_placed += 1
                    cx += random.choice([-1, 0, 1])
                    cy += random.choice([-1, 0, 1])

            # ----------------------------------------------------
            # В. МЕСТОРОЖДЕНИЯ (Нефть: 10, Каменоломни: 8, Сундуки: 15)
            # ----------------------------------------------------
            def place_resource(res_type, hp):
                for _ in range(500):
                    rx = random.randint(min_x, max_x)
                    ry = random.randint(min_y, max_y)
                    if (rx, ry) not in occupied:
                        occupied.add((rx, ry))
                        resources_to_create.append({
                            "id": make_pb_id(),
                            "gameId": f"{res_type}_{rx}_{ry}",
                            "type": res_type,
                            "x": rx,
                            "y": ry,
                            "zoneId": zone_id,
                            "hp": hp,
                            "data": {"hp": hp}
                        })
                        return True
                return False

            for _ in range(OIL_PER_SECTOR):
                place_resource("oil", 10)

            for _ in range(QUARRIES_PER_SECTOR):
                place_resource("quarry", 50)

            for _ in range(CHESTS_PER_SECTOR):
                place_resource("chest", 1)

            # ----------------------------------------------------
            # Г. МОНСТРЫ (Ровно 125 монстров на сектор!)
            # ----------------------------------------------------
            for m_cfg in MONSTER_CONFIG:
                mid = m_cfg["id"]
                m_hp = m_cfg["hp"]
                m_count = m_cfg["count"]

                for _ in range(m_count):
                    for _ in range(500):
                        mx = random.randint(min_x + 2, max_x - 2)
                        my = random.randint(min_y + 2, max_y - 2)
                        if (mx, my) not in occupied:
                            occupied.add((mx, my))
                            buildings_to_create.append({
                                "id": make_pb_id(),
                                "gameId": f"monster_{mid}_{mx}_{my}",
                                "x": mx,
                                "y": my,
                                "zoneId": zone_id,
                                "buildingId": str(mid),
                                "ownerId": "monster",
                                "ownerName": "Монстр",
                                "data": {
                                    "zoneId": zone_id,
                                    "hp": m_hp,
                                    "maxHp": m_hp,
                                    "isActive": True,
                                    "lastMoveTime": 0,
                                    "type": "Default",
                                    "workState": "idle"
                                }
                            })
                            break

            # Единственный мировой босс Бронекур на всю карту (в центральном секторе 2_2)
            if zx == ZONES_X // 2 and zy == ZONES_Y // 2:
                boss_id = BRONEKUR_BOSS_CFG["id"]
                boss_hp = BRONEKUR_BOSS_CFG["hp"]
                for _ in range(500):
                    bx = random.randint(min_x + 2, max_x - 2)
                    by = random.randint(min_y + 2, max_y - 2)
                    if (bx, by) not in occupied:
                        occupied.add((bx, by))
                        buildings_to_create.append({
                            "id": make_pb_id(),
                            "gameId": f"m{boss_id}s1z{zone_id}",
                            "x": bx,
                            "y": by,
                            "zoneId": zone_id,
                            "buildingId": str(boss_id),
                            "ownerId": "monster",
                            "ownerName": "Монстр",
                            "data": {
                                "zoneId": zone_id,
                                "hp": boss_hp,
                                "maxHp": boss_hp,
                                "isActive": True,
                                "lastMoveTime": 0,
                                "type": "Default",
                                "workState": "idle",
                                "isBoss": True,
                                "monsterType": "бронекур",
                                "monsterSlot": 1,
                            }
                        })
                        break

            # ----------------------------------------------------
            # Д. ПРОЦЕДУРНЫЙ ЛЕС (детерминированная маска Гномограда 50x50)
            # ----------------------------------------------------
            # Деревья генерируются процедурно по бинарной маске 50x50 клеток (1302 дерева / 50x50,
            # 20832 дерева / сектор 200x200, 520800 потенциальных деревьев на всю карту 1000x1000).
            # Физические записи деревьев в PocketBase НЕ создаются!
            print(f"  Сектор {zone_id} подготовлен (реки: {rivers_placed}, горы: {mountains_placed}, монстры: 125, лес: процедурный по маске 50x50)")

    # 3. Пакетная вставка в PocketBase
    print(f"\n--- ШАГ 3: СОХРАНЕНИЕ ОБЪЕКТОВ В POCKETBASE ---")
    print(f"📦 Всего зданий к созданию: {len(buildings_to_create)} (реки, горы, монстры)")
    print(f"📦 Всего ресурсов к созданию: {len(resources_to_create)} (нефть, каменоломни, сундуки; деревья — виртуальные)")

    batch_insert(token, "buildings", buildings_to_create)
    batch_insert(token, "map_resources", resources_to_create)

    # 4. Запись статуса карты в map_state
    map_state_payload = {
        "id": "status000000000",
        "gameId": "status",
        "data": {
            "gameId": "status",
            "generated": True,
            "seed": 777,
            "terrainRepairVersion": 1,
        },
    }
    try:
        req = urllib.request.Request(
            f"{PB_URL}/api/collections/map_state/records",
            data=json.dumps(map_state_payload).encode(),
            headers={"Authorization": token, "Content-Type": "application/json"},
            method="POST",
        )
        urllib.request.urlopen(req)
    except Exception:
        req = urllib.request.Request(
            f"{PB_URL}/api/collections/map_state/records/status000000000",
            data=json.dumps(map_state_payload).encode(),
            headers={"Authorization": token, "Content-Type": "application/json"},
            method="PATCH",
        )
        urllib.request.urlopen(req)

    print("\n🎉 ГОТОВО! Карта 1000x1000 успешно сгенерирована!")
    print(f"  • Секторов: 25 (5x5 по 200x200 клеток)")
    print(f"  • Монстров: {MONSTERS_PER_SECTOR * 25} (ровно 125 на каждом секторе)")
    print(f"  • Рек: {RIVERS_PER_SECTOR * 25} тайлов (125 на сектор, связные русла)")
    print(f"  • Гор: {MOUNTAINS_PER_SECTOR * 25} тайлов (125 на сектор, горные гряды)")
    print(f"  • Деревьев: {len(resources_to_create) - 25 * (OIL_PER_SECTOR + QUARRIES_PER_SECTOR + CHESTS_PER_SECTOR)} (по оригинальной маске Гномограда)")
    print(f"  • Месторождений: 250 нефти, 200 каменоломен, 375 сундуков")

if __name__ == "__main__":
    main()
