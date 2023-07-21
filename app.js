const express = require("express");
const { open } = require("sqlite");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const sqlite3 = require("sqlite3");
let db = null;
const dbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running http://localhost:3000/");
    });
  } catch (e) {
    console.log("DB error:${e.message}");
    process.exit(1);
  }
};
dbAndServer();

app.get("/players/", async (request, response) => {
  const getPlayer = `SELECT * FROM player_details;`;
  const playerArray = await db.all(getPlayer);
  const changeOBj = (playerList) => {
    return {
      playerId: playerList.player_id,
      playerName: playerList.player_name,
    };
  };
  response.send(playerArray.map((each) => changeOBj(each)));
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `SELECT * FROM player_details WHERE player_id=${playerId} `;
  const playerGet = await db.get(getPlayer);
  const m = (playerList) => {
    return {
      playerId: playerList.player_id,
      playerName: playerList.player_name,
    };
  };
  console.log(playerId);
  response.send(m(playerGet));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetalis = request.body;
  const { playerName } = playerDetalis;
  const updatePlayer = `UPDATE player_details SET player_name="${playerName}" WHERE (player_id=${playerId})`;
  await db.run(updatePlayer);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatch = `SELECT * FROM match_details WHERE match_id=${matchId} `;
  const matchGet = await db.get(getMatch);
  const m = (matchList) => {
    return {
      matchId: matchList.match_id,
      match: matchList.match,
      year: matchList.year,
    };
  };
  console.log(matchId);
  response.send(m(matchGet));
});

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getTeam = `SELECT match_details.match_id AS match_id,match_details.match AS match,match_details.year AS year FROM player_match_score INNER JOIN match_details ON player_match_score.match_id=match_details.match_id WHERE player_match_score.player_id=${playerId};`;
  const playerArray = await db.all(getTeam);
  const changeOBj = (matchList) => {
    return {
      matchId: matchList.match_id,
      match: matchList.match,
      year: matchList.year,
    };
  };
  response.send(playerArray.map((each) => changeOBj(each)));
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getTeam = `SELECT player_details.player_id AS playerId,player_details.player_name AS playerName  FROM player_match_score INNER JOIN player_details ON player_match_score.player_id=player_details.player_id WHERE player_match_score.match_id=${matchId};`;
  const playerArray = await db.all(getTeam);

  response.send(playerArray);
});
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getTeam = `SELECT player_details.player_id AS playerId,player_details.player_name AS playerName, SUM(player_match_score.score) AS totalScore,SUM(fours) AS totalFours,SUM(sixes) AS totalSixes  FROM  player_details INNER JOIN  player_match_score ON player_details.player_id=player_match_score.player_id WHERE player_details.player_id=${playerId};`;
  const playerArray = await db.get(getTeam);

  response.send(playerArray);
});

module.exports = app;
