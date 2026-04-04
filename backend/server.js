const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbFile = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create Tables
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        type TEXT,
        category TEXT,
        distance TEXT,
        eta TEXT,
        lat REAL,
        lng REAL
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id TEXT,
        severity TEXT,
        location TEXT,
        status TEXT,
        timestamp TEXT
      )`);

      // Seed Services if empty
      db.get("SELECT COUNT(*) AS count FROM services", (err, row) => {
        if (!err && row.count === 0) {
          console.log("Seeding Database...");
          const stmt = db.prepare(`INSERT INTO services (name, type, category, distance, eta, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)`);
          
          // Hospitals
          stmt.run("City Care Hospital", "Trauma Center", "hospital", "2.5 km", "8 mins", 28.61, 77.21);
          stmt.run("Green Valley Clinic", "Clinic", "hospital", "4.1 km", "12 mins", 28.62, 77.20);
          
          // Police
          stmt.run("Central Police Station", "HQ", "police", "3.0 km", "10 mins", 28.615, 77.215);
          
          // Towing
          stmt.run("Rapid Road Assist", "Heavy Towing", "towing", "1.5 km", "5 mins", 28.605, 77.205);
          
          stmt.finalize();
        }
      });
    });
  }
});

// Endpoints
app.get('/api/nearby-services', (req, res) => {
  db.all("SELECT * FROM services", [], (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, error: err.message });
      return;
    }
    
    // Group by category
    const categorized = { hospitals: [], police: [], towing: [] };
    rows.forEach(row => {
      if (row.category === 'hospital') categorized.hospitals.push(row);
      else if (row.category === 'police') categorized.police.push(row);
      else if (row.category === 'towing') categorized.towing.push(row);
    });
    
    res.json({ success: true, data: categorized });
  });
});

app.post('/api/trigger-sos', (req, res) => {
  const { location, severity, timestamp } = req.body;
  const caseId = `SOS-${Math.floor(1000 + Math.random() * 9000)}`;
  
  db.run(`INSERT INTO cases (case_id, severity, location, status, timestamp) VALUES (?, ?, ?, ?, ?)`,
    [caseId, severity, JSON.stringify(location), 'RESPONDING', timestamp],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      
      console.log(`[SOS TRIGGERED] DB Inserted: Case ${caseId}, Severity: ${severity}`);
      
      // Simulate real-time responses
      res.json({
        success: true,
        message: "SOS Logged and Routed",
        caseId: caseId,
        helpersNotified: 3,
        policeAlerted: true,
        hospitalRecommended: { name: "City Care Hospital", type: "Trauma Center" }
      });
    }
  );
});

app.post('/api/hospital-alert', (req, res) => {
  // Real world: WebSocket broadcast to specific hospital ID
  console.log(`[HOSPITAL ALERT] Preparing for arrival:`, req.body);
  res.json({ success: true, message: "Hospital is preparing for arrival" });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
