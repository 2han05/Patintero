[patinteroREADME.md](https://github.com/user-attachments/files/22450041/patinteroREADME.md)
# Patintero Leaderboard API
## 1. API Description & Features

This project is a **Leaderboard API** designed to store and manage scores for the traditional game Patintero. It allows teams to submit their scores under different modes and difficulties, and retrieve ranked leaderboards filtered by these parameters.

**Features:**
- Add team scores with mode and difficulty.
- Automatically accumulate scores if the same team plays again under the same mode and difficulty.
- Retrieve leaderboard with optional filters:
- By mode
- By difficulty
- With limit (e.g., top 5 scores only).
- Scores are always sorted in descending order.
- Lightweight in-memory storage (no external database required).

## 2. Installation / Setup

### Prerequisites:

- [Node.js](https://nodejs.org/en/) installed on your system.
- Install Visual Studio Code (or any editor).
- Install Git Bash or use your terminal.

### Steps:

**Clone the repository:**
- git clone <your-repo-url>

**Install dependencies:**
- cd <your-project-folder>
- npm install

**Start the server:**
- node server.js

**You should see:**

Leaderboard backend running at http://localhost:3000

## 3. Example Requests and Responses
## 1. Get Leaderboard

Retrieve the leaderboard. Supports filtering.

- **URL:** /api/leaderboard

- **Method:** GET

**Query Parameters (optional):**
- mode (string)
- difficulty (string)
- limit (number)

**Example Request:**
- GET http://localhost:3000/api/leaderboard?mode=classic&difficulty=hard&limit=5


**Success Response:**

```json
[
  { "team": "Team A", "score": 120, "mode": "classic", "difficulty": "hard" },
  { "team": "Team B", "score": 95, "mode": "classic", "difficulty": "hard" }
]
```
## 2. Submit Score

Add or update a team score.
- **URL:** /api/leaderboard
- **Method:** POST
- **Body (JSON):**

```json
{
  "team": "Team A",
  "score": 50,
  "mode": "classic",
  "difficulty": "easy"
}
```

**Success Response:**
```json
{ "message": "Score added successfully" }
```
**Error Response (Invalid Payload):**
```json
{ "message": "Invalid payload" }
```
## 3   . Root Route

Test if API is running.

- **URL:** /
- **Method:** GET
- **Response:**

Patintero Leaderboard API is running!

## Notes

- Scores are cumulative per team for the same mode and difficulty.
- Data is stored in-memory — restarting the server will reset the leaderboard.
- Extendable for database integration if persistence is required.
