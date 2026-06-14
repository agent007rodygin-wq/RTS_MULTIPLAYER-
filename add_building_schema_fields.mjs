// Script to add missing top-level fields to the PocketBase buildings collection schema.
// This ensures all game fields are stored at the top level (not just in data JSON),
// preventing data loss during partial updates.
//
// Usage: PB_URL=http://89.127.214.182:8090 PB_ADMIN_EMAIL=... PB_ADMIN_PASSWORD=... node add_building_schema_fields.mjs

import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://89.127.214.182:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
  console.error('Missing PB_ADMIN_EMAIL or PB_ADMIN_PASSWORD. Set them as environment variables.');
  process.exit(1);
}

const pb = new PocketBase(PB_URL);

const numberField = (name, onlyInt = false) => ({
  name,
  type: 'number',
  required: false,
  hidden: false,
  presentable: false,
  min: null,
  max: null,
  onlyInt,
});

const textField = (name) => ({
  name,
  type: 'text',
  required: false,
  hidden: false,
  presentable: false,
  min: 0,
  max: 0,
  pattern: '',
});

const boolField = (name) => ({
  name,
  type: 'bool',
  required: false,
  hidden: false,
  presentable: false,
});

// Fields to add to the buildings collection that currently only exist in the data JSON
const fieldsToAdd = [
  numberField('lastAttackTime', true),    // Last time cannon/monster attacked
  numberField('workEndTime', true),       // When work/production completes
  boolField('isDestroying'),              // Whether building is being destroyed
  numberField('destructionEndTime', true),// When destruction completes
  numberField('pendingDamage', true),     // Damage pending from destruction
  textField('initiatorId'),               // Who initiated the destruction
  textField('monsterType'),               // Type of monster (e.g., "избушка")
  numberField('monsterSlot', true),       // Monster slot in zone
  boolField('isBoss'),                    // Whether this is a boss monster
  textField('ownerName'),                 // Name of the building owner
];

async function main() {
  try {
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    console.log('Logged in as admin');

    const collection = await pb.collections.getOne('buildings');
    const existingNames = new Set(collection.fields.map(f => f.name));
    
    const missing = fieldsToAdd.filter(f => !existingNames.has(f.name));
    
    if (missing.length === 0) {
      console.log('All fields already exist in the buildings schema. Nothing to do.');
      return;
    }

    console.log(`Adding ${missing.length} missing fields: ${missing.map(f => f.name).join(', ')}`);
    
    await pb.collections.update(collection.id, {
      fields: [...collection.fields, ...missing],
    });
    
    console.log('Schema updated successfully!');
    
    // After adding fields, we should also update KNOWN_FIELDS_BY_COLLECTION in pocketbase.ts
    console.log('\nIMPORTANT: After running this script, update KNOWN_FIELDS_BY_COLLECTION.buildings');
    console.log('in src/pocketbase.ts to include these new fields:');
    console.log(missing.map(f => `'${f.name}'`).join(', '));
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}

main();
