const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const rollDiceButton = document.getElementById('rollDice');
const diceResult = document.getElementById('diceResult');

const gridSize = 10;
const cellSize = canvas.width / gridSize;
let playerPosition = 1; // Start at position 1

const playerImage = new Image();
// Object to track landed power-ups
const landedTraits = [];

const snakesCoords = [
    { start: 13, end: 10 }, 
    { start: 42, end: 36 }, 
    { start: 75, end: 53 }, 
    { start: 98, end: 84 }, 
];

const ladderCoords = [
    { start: 2, end: 18},
    { start: 6, end: 28},
    { start: 34, end: 49},
    { start: 64, end: 78},
    { start: 68, end: 90}
];

const cellBackgrounds = [
    null, "HappyFace", "LightThumb", "DarkThumb", "DarkerThumb", "HappyFace", "DarkerThumb", "LightThumb", null, null,
    "DarkerThumb", null, "SadFace", null, "LightThumb", "DarkThumb", "LightThumb", null, "DarkThumb", "DarkerThumb",
    "BlueEye", "RocketShip", "GreenEye", "BlueEye", "BrownEye", "GreenEye", "BrownEye", null, "BlueEye", "2times",
    "GreenEye", "BrownEye", null, "HappyFace", "BlueEye", "GreenEye", null, null, "BrownEye", "BrownEye",
    "BrownHair", "SadFace", null, "BlackHair", "Shield", "BrownHair", "BlackHair", "BrownHair", "BlackHair", "BrownHair",
    "BlackHair","BrownHair", null, null, "BlackHair", "PinkSkull", "BrownHair", "BlackHair", "BrownHair", "2times", "StraightHair",
    "Shield", "CurlyHair", "HappyFace", "StraightHair", null, null, "HappyFace", "CurlyHair", "RocketShip", "StraightHair",
    null, "CurlyHair", "StraightHair", "SadFace", "CurlyHair", "StraightHair", null, "CurlyHair", "StraightHair", "HappyFace",
    "GirlSymbol", "BoySymbol", null, "GirlSymbol", "BoySymbol", "RocketShip", "GirlSymbol", "BoySymbol", "GirlSymbol", "2times",
    "BoySymbol", "GirlSymbol", "BoySymbol", "GirlSymbol", "BoySymbol", "GirlSymbol", "SadFace", "BoySymbol", "Bottle"]
;

const players = [
    { position: playerPosition, image: new Image(), id: 1, shieldActive: false, doubleRoll: false },
    { position: playerPosition, image: new Image(), id: 2, shieldActive: false, doubleRoll: false }
];
players[0].image.src = "Assets/sperm.png"; // Replace with player 1's image
players[1].image.src = "Assets/sperm.png"; // Replace with player 1's image


let currentPlayerIndex = 0; // Track whose turn it is


// Modify checkForSnakesAndLadders to also track landed tiles
let shieldActive = false; // Track shield status
let doubleRoll = false;   // Track if the next roll is doubled

// Updated checkForSnakesAndLadders function with power-ups and debuffs
function checkForSnakesAndLadders(player) {
    const tileType = cellBackgrounds[player.position - 1]; // Get the tile type from the cell backgrounds

    if (tileType) {
        // Handle power-ups and debuffs specific to the player
        switch (tileType) {
            case "2times":
                player.doubleRoll = true; // Activate double roll for this player
                console.log(`Player ${player.id}: Double roll activated!`);
                break;

            case "Shield":
                if (!player.shieldActive) {
                    player.shieldActive = true; // Grant shield effect
                    console.log(`Player ${player.id}: Shield activated!`);
                }
                break;

            case "RocketShip":
                const rocketBoost = {
                    22: 39,
                    70: 71,
                    87: 94
                };
                if (rocketBoost[player.position]) {
                    player.position = rocketBoost[player.position]; // Boost to the specified position
                    console.log(`Player ${player.id}: RocketShip activated! Boosted to ${player.position}`);
                }
                break;

            case "PinkSkull":
                if (player.shieldActive) {
                    player.shieldActive = false; // Remove shield effect
                    console.log(`Player ${player.id}: Shield used! Protected from PinkSkull.`);
                } else {
                    player.position = 1; // Send back to start
                    console.log(`Player ${player.id}: Hit PinkSkull! Back to start.`);
                }
                break;
            default:
                landedTraits.push(tileType)
                break;
        }
    }

    // Check for ladder or snake movement
    for (let ladder of ladderCoords) {
        if (player.position === ladder.start) {
            return ladder.end; // Move up the ladder
            
        }
    }

    for (let snake of snakesCoords) {
        if (player.position === snake.start) {
            return snake.end; // Move down the snake
        }
    }

    return player.position; // No ladder or snake
}



const backgroundImage = new Image();
backgroundImage.src = "Assets/bgimage.png"; // Replace with your image path

// Ensure background image is loaded first
backgroundImage.onload = function () {
    drawBoard(); // Draw board after the background image is loaded
};

// Draw the game board
function drawBoard() {
    // Draw the background image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw grid cells
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            var cellNumber;
            if(gridSize % 2 != 0) {
                cellNumber = gridSize * (gridSize - row - 1) + (row % 2 === 0 ? col : gridSize - col - 1) + 1;
            } else {
                cellNumber = gridSize * (gridSize - row - 1) + (row % 2 === 0 ? gridSize - col - 1 : col) + 1;
            }

            // Draw cell border
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);

            // Draw cell number
            ctx.fillStyle = "#000000";
            ctx.font = "12px Arial";
            ctx.fillText(cellNumber, col * cellSize + 5, row * cellSize + 15);
        }
    }

    // Draw player
    drawPlayers();
}

// Get cell coordinates
function getPositionCoordinates(position) {
    const row = Math.floor((position - 1) / gridSize);
    const colInRow = (position - 1) % gridSize;
    const isOddRow = row % 2 !== 0;

    const col = isOddRow ? gridSize - colInRow - 1 : colInRow;

    return {
        x: col * cellSize,
        y: canvas.height - (row + 1) * cellSize
    };
}

// Draw the player
function drawPlayers() {
    players.forEach(player => {
        const { x, y } = getPositionCoordinates(player.position);

        // Determine the row number
        const row = Math.floor((player.position - 1) / gridSize);

        ctx.save();

        if (row % 2 === 1) { // If the row is even (0-indexed)
            ctx.translate(canvas.width, 0); // Move the origin to the right
            ctx.scale(-1, 1); // Flip the context horizontally
            ctx.drawImage(
                player.image,
                canvas.width - (x + cellSize - 5),
                y + 5,
                cellSize - 10,
                cellSize - 10
            );
        } else {
            ctx.drawImage(player.image, x + 5, y + 5, cellSize - 10, cellSize - 10);
        }

        ctx.restore();
    });
}



// Roll the dice
// Variables for dice animation
const overlay = document.createElement("div");
const overlayCanvas = document.createElement("canvas");
overlay.id = "diceOverlay";
overlayCanvas.id = "overlayCanvas";
overlayCanvas.width = 200;
overlayCanvas.height = 200;
overlay.style.position = "absolute";
overlay.style.top = "50%";
overlay.style.left = "50%";
overlay.style.transform = "translate(-50%, -50%) scale(0)";
overlay.style.transition = "transform 0.5s ease-in-out";
overlay.style.zIndex = "10";
overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)"; //transparent background
overlay.style.borderRadius = "15px";
overlay.style.display = "none";

overlay.appendChild(overlayCanvas);
document.body.appendChild(overlay);

const overlayCtx = overlayCanvas.getContext("2d");

// Draw a dice face based on the number
function drawDiceOnOverlay(number) {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    overlayCtx.fillStyle = "#ffffff";
    overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    overlayCtx.strokeStyle = "#000000";
    overlayCtx.lineWidth = 5;
    overlayCtx.strokeRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    overlayCtx.fillStyle = "#000000";
    const dotRadius = 10;
    const positions = {
        1: [[100, 100]],
        2: [[50, 50], [150, 150]],
        3: [[50, 50], [100, 100], [150, 150]],
        4: [[50, 50], [50, 150], [150, 50], [150, 150]],
        5: [[50, 50], [50, 150], [100, 100], [150, 50], [150, 150]],
        6: [[50, 50], [50, 100], [50, 150], [150, 50], [150, 100], [150, 150]],
    };

    positions[number].forEach(([x, y]) => {
        overlayCtx.beginPath();
        overlayCtx.arc(x, y, dotRadius, 0, Math.PI * 2);
        overlayCtx.fill();
    });
}


// Animate the dice roll with scaling and blurring
function rollDiceWithOverlay(callback) {
    const rollInterval = 100; // Time between frames (ms)
    const totalDuration = 1000; // Total animation time (ms)
    const frames = totalDuration / rollInterval;

    var frame = 0;
    overlay.style.display = "block";
    document.getElementById("gameCanvas").style.filter = "blur(5px)";
    overlay.style.transform = "translate(-50%, -50%) scale(1)";

    var currentRoll = 1;

    const interval = setInterval(() => {
        currentRoll = Math.ceil(Math.random() * 6); // Random dice roll
        drawDiceOnOverlay(currentRoll);
        frame++;

        if (frame >= frames) {
            clearInterval(interval);

            // Final roll
            const finalRoll = Math.ceil(Math.random() * 6);
            drawDiceOnOverlay(finalRoll);

            // Scale back down and remove overlay
            setTimeout(() => {
                overlay.style.transform = "translate(-50%, -50%) scale(0)";
                document.getElementById("gameCanvas").style.filter = "none";

                // Hide overlay after animation finishes
                setTimeout(() => {
                    overlay.style.display = "none";
                    callback(finalRoll); // Call the callback with the final roll
                }, 500);
            }, 500);
        }
    }, rollInterval);
}

var isRolling = false;
// Example of integrating with the game logic
// Roll the dice function (updated to handle double roll)
rollDiceButton.addEventListener("click", () => {
    diceResult.textContent = "Rolling...";
    if (!isRolling) {
        isRolling = true;
        rollDiceWithOverlay((finalRoll) => {
            isRolling = false;

            // Get the current player
            const currentPlayer = players[currentPlayerIndex];

            // Handle double roll
            let rollValue = finalRoll;
            if (currentPlayer.doubleRoll) {
                rollValue *= 2;
                currentPlayer.doubleRoll = false; // Reset double roll
                console.log(`Player ${currentPlayer.id}: Double roll applied! Roll: ${rollValue}`);
            }

            diceResult.textContent = `Player ${currentPlayer.id} rolled a ${rollValue}!`;

            // Update player position
            currentPlayer.position += rollValue;

            // Check if the player reached or exceeded the end
            if (currentPlayer.position >= gridSize * gridSize) {
                currentPlayer.position = gridSize * gridSize;
                diceResult.textContent += ` Player ${currentPlayer.id} wins!`;
                displayBaby()
                rollDiceButton.disabled = true; // End the game
            } else {
                // Check for snakes, ladders, power-ups, or debuffs
                currentPlayer.position = checkForSnakesAndLadders(currentPlayer);
            }

            // Redraw the board with updated player positions
            drawBoard();

            // Switch to the next player's turn
            currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        });
    }
});

function displayBaby() {
    // Trait categories and their mappings to file components
    const traitCategories = {
        sex: ["GirlSymbol", "BoySymbol"],
        skincolor: ["LightThumb", "DarkThumb", "DarkerThumb"],
        eyecolor: ["BlueEye", "GreenEye", "BrownEye"],
        haircolor: ["BrownHair", "BlackHair"],
        hairstyle: ["CurlyHair", "StraightHair"]
    };

    // Initialize trait counts
    const traitCounts = {
        sex: {},
        skincolor: {},
        eyecolor: {},
        haircolor: {},
        hairstyle: {}
    };

    // Count occurrences of each trait
    for (const trait of landedTraits) {
        for (const category in traitCategories) {
            if (traitCategories[category].includes(trait)) {
                traitCounts[category][trait] = (traitCounts[category][trait] || 0) + 1;
            }
        }
    }

    // Determine the most frequently landed-on trait for each category
    const selectedTraits = {};
    for (const category in traitCounts) {
        const traits = traitCounts[category];
        selectedTraits[category] = Object.keys(traits).reduce((a, b) => traits[a] > traits[b] ? a : b, null);
    }

    // Map the selected traits to the file format
    const sex = selectedTraits.sex ? (selectedTraits.sex === "GirlSymbol" ? "female" : "male") : "male";
    const skincolor = selectedTraits.skincolor ? selectedTraits.skincolor.replace("Thumb", "").toLowerCase() : "light";
    const eyecolor = selectedTraits.eyecolor ? selectedTraits.eyecolor.replace("Eye", "").toLowerCase() : "blue";
    const haircolor = selectedTraits.haircolor ? selectedTraits.haircolor.replace("Hair", "").toLowerCase() : "black";
    const hairstyle = selectedTraits.hairstyle ? selectedTraits.hairstyle.replace("Hair", "").toLowerCase() : "curly";

    // Construct the file path
    const babyFileName = `Assets/${sex}_${skincolor}_${eyecolor}_${hairstyle}_${haircolor}.png`;

    // Log the result (or update to display the image on the canvas)
    console.log(`Generated baby image file: ${babyFileName}`);

    // Load and display the baby image
    const babyImage = new Image();
    babyImage.src = babyFileName;

    babyImage.onload = () => {
        // Clear the canvas and display the baby image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(babyImage, 0, 0, canvas.width, canvas.height);
    };

    babyImage.onerror = () => {
        console.error("Failed to load baby image:", babyFileName);
    };
}


/*function setPlayerPosition(playerId, position) {
    const player = players.find(p => p.id === playerId);
    if (!player) {
        console.error(`Player with ID ${playerId} not found.`);
        return;
    }

    if (position >= 1 && position <= gridSize * gridSize) {
        player.position = position;
        console.log(`Player ${playerId} position set to ${position}`);

        if (player.position >= gridSize * gridSize) {
            player.position = gridSize * gridSize;
            diceResult.textContent += ` Player ${playerId} reached the end!`;

            console.log(`Player ${playerId} Game Over!`);
        } else {
            // Check for snakes, ladders, power-ups, or debuffs
            const newPosition = checkForSnakesAndLadders(player);
            if (newPosition !== player.position) {
                if (newPosition > player.position) {
                    diceResult.textContent += ` Player ${playerId} climbed a ladder to ${newPosition}!`;
                } else if (newPosition < player.position) {
                    diceResult.textContent += ` Player ${playerId} slid down a snake to ${newPosition}!`;
                }
                player.position = newPosition;
            }
        }

        drawBoard();
    } else {
        console.error("Invalid position. Must be between 1 and 100.");
    }
}
*/
