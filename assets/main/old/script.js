document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('snake-game');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('start-button');
    const gameOverDiv = document.getElementById('game-over');
    const respawnButton = document.getElementById('respawn-button');
    const scoreDisplay = document.getElementById('score');
    const box = 20;
    const canvasSize = 400;
    let snake;
    let food;
    let score;
    let d;
    let game;
    let isGameRunning = false;
    let canChangeDirection = true;

    // Snake game
    startButton.addEventListener('click', startGame);
    respawnButton.addEventListener('click', startGame);
    document.addEventListener('keydown', event => {
        if (event.keyCode === 32 && !isGameRunning) { // Space key
            startGame();
        }
    });

    function startGame() {
        gameOverDiv.style.display = 'none';
        startButton.style.display = 'none';
        scoreDisplay.textContent = 'Score: 0';
        snake = [];
        snake[0] = { x: 9 * box, y: 10 * box };
        food = getNewFoodPosition();
        score = 0;
        d = null;
        isGameRunning = true;
        canChangeDirection = true;
        document.addEventListener('keydown', direction);
        document.addEventListener('keydown', preventArrowScroll);
        game = setInterval(draw, 100);
    }

    function direction(event) {
        if (!canChangeDirection) return;

        if (event.keyCode == 37 && d != "RIGHT") {
            d = "LEFT";
        } else if (event.keyCode == 38 && d != "DOWN") {
            d = "UP";
        } else if (event.keyCode == 39 && d != "LEFT") {
            d = "RIGHT";
        } else if (event.keyCode == 40 && d != "UP") {
            d = "DOWN";
        }

        canChangeDirection = false;
    }

    function preventArrowScroll(event) {
        if (isGameRunning && [37, 38, 39, 40].includes(event.keyCode)) {
            event.preventDefault();
        }
    }

    function collision(newHead, snake) {
        for (let i = 0; i < snake.length; i++) {
            if (newHead.x == snake[i].x && newHead.y == snake[i].y) {
                return true;
            }
        }
        return false;
    }

    function getNewFoodPosition() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * 19 + 1) * box,
                y: Math.floor(Math.random() * 19 + 1) * box
            };
        } while (collision(newFood, snake));
        return newFood;
    }

    function draw() {
        ctx.clearRect(0, 0, canvasSize, canvasSize);

        for (let i = 0; i < snake.length; i++) {
            ctx.fillStyle = (i == 0) ? "#00ff00" : "#ffffff";
            ctx.beginPath();
            ctx.arc(snake[i].x + box / 2, snake[i].y + box / 2, box / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = "#00ff00";
            ctx.stroke();
        }

        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, 2 * Math.PI);
        ctx.fill();

        let snakeX = snake[0].x;
        let snakeY = snake[0].y;

        if (d == "LEFT") snakeX -= box;
        if (d == "UP") snakeY -= box;
        if (d == "RIGHT") snakeX += box;
        if (d == "DOWN") snakeY += box;

        if (snakeX == food.x && snakeY == food.y) {
            score++;
            scoreDisplay.textContent = 'Score: ' + score;
            food = getNewFoodPosition();
        } else {
            snake.pop();
        }

        let newHead = {
            x: snakeX,
            y: snakeY
        };

        if (snakeX < 0 || snakeY < 0 || snakeX >= canvasSize || snakeY >= canvasSize || collision(newHead, snake)) {
            clearInterval(game);
            isGameRunning = false;
            gameOverDiv.style.display = 'block';
            return;
        }

        snake.unshift(newHead);
        canChangeDirection = true;
    }
});
