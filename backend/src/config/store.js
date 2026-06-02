const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(process.cwd(), 'data', 'stores.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Load or initialize DB
let db = { stores: {}, usageRecords: {}, invoices: {}, logs: [] };

try {
  if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  }
} catch (e) {
  console.log('Creating new database...');
}

const saveDB = () => {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
};

module.exports = { db, saveDB };