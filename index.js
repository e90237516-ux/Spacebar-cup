// ===============================
// SPACEBAR CUP — FULL JAVASCRIPT GAME (FINAL VERSION)
// ===============================

const app = document.getElementById("app");
const flash = document.getElementById("flash");

// ===============================
// LOCAL STORAGE (DATASTORE)
// ===============================

let coins = Number(localStorage.getItem("coins")) || 0;
let wins = Number(localStorage.getItem("wins")) || 0;

let upgrades = JSON.parse(localStorage.getItem("upgrades")) || {
    fasterPress: false,
    doubleCoins: false,
    doublePress: false
};

function saveData() {
    localStorage.setItem("coins", coins);
    localStorage.setItem("wins", wins);
    localStorage.setItem("upgrades", JSON.stringify(upgrades));
}

// ===============================
// GAME VARIABLES
// ===============================

let mode = null;
let teams = ["France", "Argentina", "Brazil", "England", "USA", "Mexico"];

let flags = {
    "France": "https://flagcdn.com/w80/fr.png",
    "Argentina": "https://flagcdn.com/w80/ar.png",
    "Brazil": "https://flagcdn.com/w80/br.png",
    "England": "https://flagcdn.com/w80/gb-eng.png",
    "USA": "https://flagcdn.com/w80/us.png",
    "Mexico": "https://flagcdn.com/w80/mx.png"
};

let flashColors = {
    "France": ["#0055A4", "#FFFFFF", "#EF4135"],
    "Argentina": ["#74ACDF", "#FFFFFF", "#74ACDF"],
    "Brazil": ["#009C3B", "#FFDF00", "#002776"],
    "England": ["#FFFFFF", "#CE1126", "#FFFFFF"],
    "USA": ["#B22234", "#FFFFFF", "#3C3B6E"],
    "Mexico": ["#006847", "#FFFFFF", "#CE1126"]
};

let chosenTeam1 = null;
let chosenTeam2 = null;

let playerScore = 0;
let player2Score = 0;
let botScore = 0;

let botInterval = 3000; // base speed
let botTimer = null;

let round = "Round of 16";

// ===============================
// RENDER FUNCTION
// ===============================

function render(html) {
    app.innerHTML = html;
}

// ===============================
// MAIN MENU
// ===============================

function showMenu() {
    render(`
        <h1 style="font-size:50px; margin-bottom:20px;">Spacebar Cup</h1>
        <button onclick="startBotMode()">Player vs Bot</button>
        <button onclick="startPvPMode()">Player vs Player</button>
        <button onclick="showShop()">Shop (Coins: ${coins})</button>
        <button onclick="showLeaderboard()">Leaderboard</button>
    `);
}

// ===============================
// TEAM SELECTION
// ===============================

function chooseTeam(player) {
    let html = `<h1>${player}: Choose Your Team</h1>`;

    teams.forEach(team => {
        html += `
            <div style="margin:15px;">
                <img class="flag" src="${flags[team]}">
                <button onclick="selectTeam('${player}', '${team}')">${team}</button>
            </div>
        `;
    });

    render(html);
}

function selectTeam(player, team) {
    if (player === "Player 1") {
        chosenTeam1 = team;
        if (mode === "bot") {
            startBotMatch();
        } else {
            chooseTeam("Player 2");
        }
    } else {
        chosenTeam2 = team;
        startPvPMatch();
    }
}

// ===============================
// FULL SCREEN VICTORY FLASH
// ===============================

function victoryFlash(team) {
    let colors = flashColors[team];
    let i = 0;

    let interval = setInterval(() => {
        flash.style.background = colors[i];
        flash.style.opacity = 1;

        setTimeout(() => {
            flash.style.opacity = 0;
        }, 300);

        i++;
        if (i >= colors.length) {
            clearInterval(interval);
        }
    }, 400);
}

// ===============================
// PLAYER VS BOT MODE
// ===============================

function startBotMode() {
    mode = "bot";
    chooseTeam("Player 1");
}

function startBotMatch() {
    playerScore = 0;
    botScore = 0;

    render(`
        <h1>${round}</h1>
        <img class="flag" src="${flags[chosenTeam1]}">
        <p>You (${chosenTeam1}) vs Bot</p>
        <p id="scores">You: 0 | Bot: 0</p>
        <p>Press SPACEBAR to race!</p>
    `);

    document.onkeydown = (e) => {
        if (e.code === "Space") {
            let pressAmount = 1;

            if (upgrades.doublePress) pressAmount = 2;
            if (upgrades.fasterPress) pressAmount += 1;

            playerScore += pressAmount;

            updateBotScores();
            checkBotWinner();
        }
    };

    botTimer = setInterval(() => {
        botScore += 3; // faster bot
        updateBotScores();
        checkBotWinner();
    }, botInterval);
}

function updateBotScores() {
    document.getElementById("scores").textContent =
        `You: ${playerScore} | Bot: ${botScore}`;
}

function checkBotWinner() {
    if (playerScore >= 100) {
        clearInterval(botTimer);
        wins++;
        coins += upgrades.doubleCoins ? 20 : 10;
        saveData();

        victoryFlash(chosenTeam1);

        let nextOpponent = teams[Math.floor(Math.random() * teams.length)];

        render(`
            <h1>You Win!</h1>
            <p>Next Opponent:</p>
            <img class="flag" src="${flags[nextOpponent]}">
            <p>${nextOpponent}</p>
            <p>Press N to continue</p>
        `);

        document.onkeydown = (e) => {
            if (e.code === "KeyN") {
                chosenTeam2 = nextOpponent;
                nextRound();
            }
        };
    }

    if (botScore >= 100) {
        clearInterval(botTimer);
        render(`
            <h1>You Lost!</h1>
            <p>Press R to restart</p>
        `);

        document.onkeydown = (e) => {
            if (e.code === "KeyR") {
                round = "Round of 16";
                botInterval = 3000;
                showMenu();
            }
        };
    }
}

function nextRound() {
    if (round === "Round of 16") round = "Quarter Finals";
    else if (round === "Quarter Finals") round = "Semi Finals";
    else if (round === "Semi Finals") round = "Final";
    else {
        render(`
            <h1>You Won The Spacebar Cup!</h1>
            <img class="flag" src="${flags[chosenTeam1]}">
            <p>Press R to restart</p>
        `);

        flash.style.backgroundImage = `url(${flags[chosenTeam1]})`;
        flash.style.backgroundSize = "cover";
        flash.style.backgroundPosition = "center";
        flash.style.opacity = 1;

        setTimeout(() => {
            flash.style.opacity = 0;
            flash.style.backgroundImage = "";
        }, 1500);

        document.onkeydown = (e) => {
            if (e.code === "KeyR") {
                round = "Round of 16";
                botInterval = 3000;
                showMenu();
            }
        };
        return;
    }

    botInterval = botInterval / 3; // 3× faster each round
    startBotMatch();
}

// ===============================
// PLAYER VS PLAYER MODE
// ===============================

function startPvPMode() {
    mode = "pvp";
    chooseTeam("Player 1");
}

function startPvPMatch() {
    playerScore = 0;
    player2Score = 0;

    render(`
        <h1>Player vs Player</h1>
        <img class="flag" src="${flags[chosenTeam1]}">
        <img class="flag" src="${flags[chosenTeam2]}">
        <p>P1 (${chosenTeam1}) — Press W</p>
        <p>P2 (${chosenTeam2}) — Press I</p>
        <p id="scores">P1: 0 | P2: 0</p>
    `);

    document.onkeydown = (e) => {
        if (e.code === "KeyW") {
            let pressAmount = upgrades.doublePress ? 2 : 1;
            playerScore += pressAmount;
        }

        if (e.code === "KeyI") {
            player2Score++;
        }

        document.getElementById("scores").textContent =
            `P1: ${playerScore} | P2: ${player2Score}`;

        if (playerScore >= 100) endPvP("Player 1");
        if (player2Score >= 100) endPvP("Player 2");
    };
}

function endPvP(winner) {
    render(`
        <h1>${winner} Wins!</h1>
        <p>Press R to restart</p>
    `);

    document.onkeydown = (e) => {
        if (e.code === "KeyR") showMenu();
    };
}

// ===============================
// SHOP
// ===============================

function showShop() {
    render(`
        <h1>Shop</h1>
        <p>Coins: ${coins}</p>

        <button onclick="buyUpgrade('fasterPress')">
            Faster Press (20 coins)
        </button>

        <button onclick="buyUpgrade('doubleCoins')">
            Double Coins (50 coins)
        </button>

        <button onclick="buyUpgrade('doublePress')">
            2× Press (30 coins)
        </button>

        <button onclick="showMenu()">Back</button>
    `);
}

function buyUpgrade(type) {
    if (type === "fasterPress" && coins >= 20) {
        upgrades.fasterPress = true;
        coins -= 20;
    }

    if (type === "doubleCoins" && coins >= 50) {
        upgrades.doubleCoins = true;
        coins -= 50;
    }

    if (type === "doublePress" && coins >= 30) {
        upgrades.doublePress = true;
        coins -= 30;
    }

    saveData();
    showShop();
}

// ===============================
// LEADERBOARD
// ===============================

function showLeaderboard() {
    render(`
        <h1>Leaderboard</h1>
        <p>Total Wins: ${wins}</p>
        <p>Total Coins: ${coins}</p>
        <button onclick="showMenu()">Back</button>
    `);
}

// ===============================
// START GAME
// ===============================

showMenu();
