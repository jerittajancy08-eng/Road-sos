/*const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server: SocketServer } = require("socket.io");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// 🔥 create HTTP server + socket
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: "*",
  },
});

// temporary storage
let requests = [];

// ================= TEST =================
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ================= SEND SOS =================
app.post("/sos", (req, res) => {
  const { lat, lng, user, role } = req.body;

  const newSOS = {
    lat,
    lng,
    user: user || "Someone",
    role: role || "helper",
    time: Date.now(),
    status: "pending",
  };

  requests.push(newSOS);

  console.log("🚨 SOS RECEIVED:", newSOS);

  // 🔥 REALTIME EMIT
  io.emit("newSOS", newSOS);

  res.json({ message: "SOS received" });
});

// ================= GET ALL =================
app.get("/sos", (req, res) => {
  res.json(requests);
});

// ================= UPDATE STATUS =================
app.post("/update-status", (req, res) => {
  const { id, status } = req.body;

  requests = requests.map((sos, index) =>
    index === id ? { ...sos, status } : sos
  );

  // 🔥 broadcast update
  io.emit("statusUpdated", requests);

  res.json({ success: true });
});
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("sendSOS", (data) => {
    io.emit("newSOS", data); // send to everyone
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
// ================= START SERVER =================
server.listen(5000, () => {
  console.log("🔥 Server running on http://localhost:5000");
});
*/
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let requests = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🚨 When user sends accident
  socket.on("sendRequest", (data) => {
    requests.push(data);

    // send to ALL (helper, police, hospital)
    io.emit("newRequest", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Additional imports
const path = require('path');

// Serve static data (hospitals, services) from /data
app.use('/data', express.static(path.join(__dirname, 'data')));

// Periodic mock accident generation (if no SOS within last 30s)
setInterval(() => {
  const now = Date.now();
  // If no recent SOS, create a mock one
  const recent = requests.filter(r => now - r.time < 30000);
  if (recent.length === 0) {
    const mockSOS = {
      id: Date.now(),
      lat: 13.08 + (Math.random() - 0.5) * 0.02,
      lng: 80.27 + (Math.random() - 0.5) * 0.02,
      severity: ['high','medium','low'][Math.floor(Math.random()*3)],
      time: now,
      status: 'pending',
    };
    requests.push(mockSOS);
    io.emit('newSOS', mockSOS);
  }
}, 15000);

// Periodic mock helper acceptance for pending SOS requests
setInterval(() => {
  const pending = requests.filter(r => r.status === 'pending');
  if (pending.length === 0) return;
  const target = pending[Math.floor(Math.random()*pending.length)];
  const helper = {
    helperId: 'helper_' + Math.floor(Math.random()*1000),
    name: 'Helper ' + Math.floor(Math.random()*100),
    contact: '+91' + (9000000000 + Math.floor(Math.random()*1000000)),
  };
  // Update request with helper info
  target.helpers = target.helpers || [];
  target.helpers.push(helper);
  io.emit('helperUpdate', { sosId: target.id, helpers: target.helpers });
}, 10000);


server.listen(5000, () => {
  console.log("🔥 Server running on port 5000");
});