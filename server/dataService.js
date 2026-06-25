const fs = require('fs');
const path = require('path');
const Application = require('./models/Application');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read JSON file database
function readJSONDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading JSON fallback DB:', err);
    return [];
  }
}

// Helper to write JSON file database
function writeJSONDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing JSON fallback DB:', err);
  }
}

let isMongoConnected = false;

function setMongoConnected(status) {
  isMongoConnected = status;
  console.log(`Database Service: Mongo connection state set to ${status ? 'CONNECTED' : 'DISCONNECTED'}`);
}

async function saveApplication(data) {
  if (isMongoConnected) {
    try {
      const app = new Application(data);
      return await app.save();
    } catch (err) {
      console.error('MongoDB save failed, falling back to JSON DB:', err.message);
    }
  }
  
  // Local JSON Database Fallback
  const db = readJSONDB();
  const newApp = {
    _id: Date.now().toString(),
    ...data,
    createdAt: new Date().toISOString()
  };
  db.push(newApp);
  writeJSONDB(db);
  return newApp;
}

async function getAllApplications() {
  if (isMongoConnected) {
    try {
      return await Application.find().sort({ createdAt: -1 });
    } catch (err) {
      console.error('MongoDB fetch failed, falling back to JSON DB:', err.message);
    }
  }
  
  const db = readJSONDB();
  // Sort by date descending
  return [...db].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getApplicationById(id) {
  if (isMongoConnected) {
    try {
      const app = await Application.findById(id);
      if (app) return app;
    } catch (err) {
      console.error('MongoDB fetch by ID failed, falling back to JSON DB:', err.message);
    }
  }
  
  const db = readJSONDB();
  return db.find(app => app._id === id) || null;
}

module.exports = {
  setMongoConnected,
  saveApplication,
  getAllApplications,
  getApplicationById
};
