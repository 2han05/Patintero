 const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    const area = { x: 50, y: 50, w: 800, h: 600 };
    const lineCount = 3;
    const spacing = area.h / (lineCount + 1);

    let runners, defenders, gameOver, winner, gameStarted = false;
    let scores = { attackers: 0, defenders: 0 };
    const keys = {};

    const gameMode = "2P";
    const gameDifficulty = "Hard";

    function initGame() {
      runners = [
        { x: area.x + area.w / 3, y: area.y + area.h - 20, r: 14, speed: 5.2, color: "blue", keys: { up:"ArrowUp", down:"ArrowDown", left:"ArrowLeft", right:"ArrowRight", power:"1" }, reachedTop:false, active:true, poweringUp:false, powerTimer:0, usedPower:false },
        { x: area.x + 2*area.w / 3, y: area.y + area.h - 20, r: 14, speed: 5.2, color: "purple", keys: { up:"w", down:"s", left:"a", right:"d", power:"q" }, reachedTop:false, active:true, poweringUp:false, powerTimer:0, usedPower:false }
      ];

      defenders = [];
      for (let i = 0; i < lineCount; i++) {
        let y = area.y + spacing * (i + 1);
        defenders.push({ x: area.x + area.w / 2, y, r: 14, speed: 50 });
      }

      gameOver = false;
      winner = "";
    }

    window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
    window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

    function update() {
      if (!gameStarted || gameOver) return;

      runners.forEach(r => {
        if (!r.active) return;

        if (keys[r.keys.power.toLowerCase()] && !r.poweringUp && !r.usedPower) {
          r.poweringUp = true;
          r.usedPower = true;
          r.powerTimer = 14;
        }

        if (r.poweringUp) {
          r.powerTimer--;
          if (r.powerTimer <= 0) r.poweringUp = false;
        }

        if (keys[r.keys.up.toLowerCase()]) r.y -= r.speed;
        if (keys[r.keys.down.toLowerCase()]) r.y += r.speed;
        if (keys[r.keys.left.toLowerCase()]) r.x -= r.speed;
        if (keys[r.keys.right.toLowerCase()]) r.x += r.speed;

        r.x = Math.max(area.x, Math.min(area.x + area.w, r.x));
        r.y = Math.max(area.y, Math.min(area.y + area.h, r.y));

        if (r.y <= area.y + 5) r.reachedTop = true;
        if (r.reachedTop && r.y >= area.y + area.h - 10) {
          gameOver = true;
          winner = "Attackers Win!";
          scores.attackers++;
          showGameOver(winner, true); // send score
        }
      });

      defenders.forEach((d, index) => {
        let zoneTop = area.y + spacing * index;
        let zoneBottom = area.y + spacing * (index + 1);

        let closest = null;
        let minDist = Infinity;

        runners.forEach(r => {
          if (!r.active) return;
          if (r.y >= zoneTop - 30 && r.y <= zoneBottom + 30) {
            let dx = r.x - d.x;
            let dist = Math.abs(dx);
            if (dist < minDist) {
              minDist = dist;
              closest = r;
            }
          }
        });

        if (closest) {
          if (closest.x < d.x) d.x -= d.speed;
          else if (closest.x > d.x) d.x += d.speed;
        }
      });

      defenders.forEach(d => {
        runners.forEach(r => {
          if (!r.active || r.poweringUp) return;
          let dx = r.x - d.x, dy = r.y - d.y;
          let dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < r.r + d.r) r.active = false;
        });
      });

      if (runners.every(r => !r.active)) {
        gameOver = true;
        winner = "Defenders Win!";
        showGameOver(winner, false); // do NOT send score
      }
    }

    function drawRunner(r) {
      if (!r.active) return;
      ctx.save();
      if (r.poweringUp) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r + 12, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,215,0,0.4)";
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.fillStyle = r.color;
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.stroke();
      ctx.restore();
    }

    function drawDefender(d) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(d.x, d.y - d.r);
      ctx.lineTo(d.x - d.r, d.y);
      ctx.lineTo(d.x, d.y + d.r);
      ctx.lineTo(d.x + d.r, d.y);
      ctx.closePath();
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.stroke();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height);

      ctx.strokeStyle = "#444";
      ctx.lineWidth = 4;
      ctx.strokeRect(area.x, area.y, area.w, area.h);

      ctx.fillStyle = "rgba(0,255,0,0.1)";
      ctx.fillRect(area.x, area.y, area.w, 20);
      ctx.fillRect(area.x, area.y + area.h - 20, area.w, 20);

      ctx.strokeStyle = "#999";
      ctx.setLineDash([10, 8]);
      for (let i = 0; i < lineCount; i++) {
        let y = area.y + spacing * (i + 1);
        ctx.beginPath();
        ctx.moveTo(area.x, y);
        ctx.lineTo(area.x + area.w, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      runners.forEach(drawRunner);
      defenders.forEach(drawDefender);

      ctx.fillStyle = "#000";
      ctx.font = "20px Comic Sans MS";
      ctx.textAlign = "left";
      ctx.fillText(`Attackers: ${scores.attackers}`, 60, 30);

    }

    function loop() { update(); draw(); requestAnimationFrame(loop); }

    async function showGameOver(text, sendScore) {
      const overlay = document.getElementById("gameOverOverlay");
      document.getElementById("gameOverText").innerText = text;
      overlay.style.display = "flex";

      if (sendScore) {
        const teamName = document.getElementById("teamNameInput").value.trim() || "Unknown Team";

        try {
          await fetch("http://localhost:3000/api/leaderboard", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              team: teamName,
              score: 1, // always 1 point
              mode: gameMode,
              difficulty: gameDifficulty
            })
          });

          const res = await fetch(`http://localhost:3000/api/leaderboard?mode=${gameMode}&difficulty=${gameDifficulty}&limit=10`);
          const leaderboard = await res.json();
          const list = document.getElementById("leaderboardList");
          list.innerHTML = "";
          leaderboard.forEach((entry, i) => {
            const div = document.createElement("div");
            div.textContent = `${i+1}. ${entry.team} - ${entry.score}`;
            list.appendChild(div);
          });
        } catch(err) { console.error(err); }
      }
    }

    document.getElementById("restartBtn").addEventListener("click", () => initGame());
    document.getElementById("homeBtn").addEventListener("click", () => window.location.href = "../home.html");
    document.getElementById("playBtn").addEventListener("click", () => {
      const teamName = document.getElementById("teamNameInput").value.trim();
      if (!teamName) { alert("Please enter a team name!"); return; }
      document.getElementById("startOverlay").style.display = "none";
      gameStarted = true;
      initGame();
    });
    document.getElementById("playAgainBtn").addEventListener("click", () => {
      document.getElementById("gameOverOverlay").style.display = "none";
      initGame();
    });

    initGame();
    loop();