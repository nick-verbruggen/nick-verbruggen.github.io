const canvas = document.getElementById("snake-game");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const startButton = document.getElementById("start-button");
const gameOverDiv = document.getElementById("game-over");
const respawnButton = document.getElementById("respawn-button");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
let food = {};
let dx = 0;
let dy = -1;
let score = 10;
let gameRunning = false;

function randomFood() {
    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * (canvas.height / gridSize)),
        };
    } while (isFoodOnSnake(newFood));
    food = newFood;
}

function isFoodOnSnake(food) {
    return snake.some(segment => segment.x === food.x && segment.y === food.y);
}

function clearScreen() {
    ctx.fillStyle = "#13191f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "#ffffff" : "#00594f";
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2);
    }
}

function drawFood() {
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    console.log("moving snake", head, snake);
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = `Score: ${score}`;
        randomFood();
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];

    if (dx === 0 && dy === 0) {
        return false;
    }

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= canvas.height / gridSize) {
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

function gameLoop() {
    if (!gameRunning) return;

    moveSnake();

    if (checkCollision()) {
        gameRunning = false;
        gameOverDiv.style.display = "block";
        startButton.style.display = "none";
        console.log(snake, food);
        return;
    }

    console.log(snake, food);
    clearScreen();
    drawFood();
    drawSnake();

    setTimeout(gameLoop, 100);
}

function startGame() {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    gameRunning = true;
    gameOverDiv.style.display = "none";
    startButton.style.display = "none";

    randomFood();
    clearScreen();
    drawFood();
    drawSnake();
    gameLoop();
}

function resetGame() {
    gameRunning = false;
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    gameOverDiv.style.display = "none";
    startButton.style.display = "inline-block";
    clearScreen();
}

startButton.addEventListener("click", startGame);
respawnButton.addEventListener("click", startGame);

document.addEventListener("keydown", (e) => {
    if (!gameRunning) return;

    switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
            if (dx !== 1) {
                dx = -1;
                dy = 0;
            }
            break;
        case "ArrowUp":
        case "w":
        case "W":
            if (dy !== 1) {
                dx = 0;
                dy = -1;
            }
            break;
        case "ArrowRight":
        case "d":
        case "D":
            if (dx !== -1) {
                dx = 1;
                dy = 0;
            }
            break;
        case "ArrowDown":
        case "s":
        case "S":
            if (dy !== -1) {
                dx = 0;
                dy = 1;
            }
            break;
    }
});

clearScreen();