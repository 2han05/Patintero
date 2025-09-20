// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3000;
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');

// Middleware
app.use(express.json()); // replaces body-parser
app.use(cors()); // adjust origin in production if needed
app.use(express.static(path.join(__dirname, '/')));

// Rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per window
});
app.use('/api/', limiter);

// Load leaderboard from file or start empty
let leaderboard = [];
if (fs.existsSync(LEADERBOARD_FILE)) {
  try {
    leaderboard = JSON.parse(fs.readFileSync(LEADERBOARD_FILE));
  } catch (err) {
    console.error('Error reading leaderboard file:', err);
  }
}

// Helper: save leaderboard to file
function saveLeaderboard() {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboard, null, 2));
}

// GET /api/leaderboard?mode=&difficulty=&limit=&page=&pageSize=
app.get('/api/leaderboard', (req, res) => {
  const { mode, difficulty, limit, page, pageSize } = req.query;

  let filtered = leaderboard;

  if (mode) filtered = filtered.filter(e => e.mode === mode.trim());
  if (difficulty) filtered = filtered.filter(e => e.difficulty === difficulty.trim());

  filtered.sort((a, b) => b.score - a.score);

  // Pagination
  const p = parseInt(page) || 1;
  const ps = parseInt(pageSize) || (limit ? parseInt(limit) : filtered.length);
  const paginated = filtered.slice((p - 1) * ps, p * ps);

  // Add ranking
  const result = paginated.map((entry, index) => ({
    rank: (p - 1) * ps + index + 1,
    ...entry,
  }));

  res.json(result);
});

// POST /api/leaderboard
app.post('/api/leaderboard', (req, res) => {
  let { team, score, mode, difficulty } = req.body;

  // Validate input
  if (!team || typeof score !== 'number' || !mode || !difficulty) {
    return res.status(400).json({ message: 'Invalid payload' });
  }
  if (score < 0) return res.status(400).json({ message: 'Score cannot be negative' });

  team = team.trim();
  mode = mode.trim();
  difficulty = difficulty.trim();

  // Check if team already exists
  const existing = leaderboard.find(e => e.team === team && e.mode === mode && e.difficulty === difficulty);
  if (existing) {
    existing.score += score; // cumulative score
  } else {
    leaderboard.push({ team, score, mode, difficulty });
  }

  saveLeaderboard();
  res.json({ message: 'Score added successfully' });
});

// Root route
app.get('/', (req, res) => {
  res.send('Patintero Leaderboard API is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Leaderboard backend running at http://localhost:${PORT}`);
});
