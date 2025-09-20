// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files (HTML/CSS/JS) from the project root
app.use(express.static(path.join(__dirname, '/')));

// In-memory leaderboard storage
let leaderboard = [];

/**
 * GET /api/leaderboard
 * Optional query params:
 *   - mode (string)
 *   - difficulty (string)
 *   - limit (number)
 */
app.get('/api/leaderboard', (req, res) => {
  const { mode, difficulty, limit } = req.query;

  let filtered = leaderboard;

  if (mode) filtered = filtered.filter(entry => entry.mode === mode);
  if (difficulty) filtered = filtered.filter(entry => entry.difficulty === difficulty);

  // Sort by score descending
  filtered.sort((a, b) => b.score - a.score);

  const top = limit ? filtered.slice(0, parseInt(limit)) : filtered;

  res.json(top);
});

/**
 * POST /api/leaderboard
 * Body: { team: string, score: number, mode: string, difficulty: string }
 */
app.post('/api/leaderboard', (req, res) => {
  const { team, score, mode, difficulty } = req.body;

  if (!team || typeof score !== 'number' || !mode || !difficulty) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  // Check if team already exists for the same mode/difficulty
  const existing = leaderboard.find(e => e.team === team && e.mode === mode && e.difficulty === difficulty);
  if (existing) {
    // Add score to existing entry (cumulative)
    existing.score += score;
  } else {
    // Add new entry
    leaderboard.push({ team, score, mode, difficulty });
  }

  res.json({ message: 'Score added successfully' });
});

// Optional root route
app.get('/', (req, res) => {
  res.send('Patintero Leaderboard API is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Leaderboard backend running at http://localhost:${PORT}`);
}); 