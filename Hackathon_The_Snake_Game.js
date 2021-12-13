/*****************************INPUT*****************************/
let inputDirection = { x: 0, y: 0 };
let lastInputDirection = { x: 0, y: 0 };

//https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
//https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values#navigation_keys
window.addEventListener('keydown', e => {
  switch (e.key) {

    case 'ArrowUp':
      if (lastInputDirection.y !== 0) break;
      inputDirection = { x: 0, y: -1 };
      break;

    case 'ArrowDown':
      if (lastInputDirection.y !== 0) break;
      inputDirection = { x: 0, y: 1 };
      break;

    case 'ArrowLeft':
      if (lastInputDirection.x !== 0) break;
      inputDirection = { x: -1, y: 0 };
      break;

    case 'ArrowRight':
      if (lastInputDirection.x !== 0) break;
      inputDirection = { x: 1, y: 0 };
      break;
  }
});

function getInputDirection() {
  lastInputDirection = inputDirection;
  return inputDirection;
}

/*****************************SNAKE*****************************/
const snakeBody = [{ x: 11, y: 11 }];
let newSegments = 0;

function updateSnake() {
  addSegments();

  //https://codeburst.io/what-are-three-dots-in-javascript-6f09476b03e1 - Spread syntax
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
  //https://www.freecodecamp.org/news/an-introduction-to-spread-syntax-in-javascript-fba39595922c/
  const inputDirection = getInputDirection();
  for (let i = snakeBody.length - 2; i >= 0; i--) {
    snakeBody[i + 1] = { ...snakeBody[i] };
  }

  snakeBody[0].x += inputDirection.x;
  snakeBody[0].y += inputDirection.y;
}

function drawSnake(gameBoard) {
  snakeBody.forEach(segment => {
    const snakeElement = document.createElement('div');
    snakeElement.style.gridRowStart = segment.y;
    snakeElement.style.gridColumnStart = segment.x;
    snakeElement.classList.add('snake');
    gameBoard.appendChild(snakeElement);

    let snakeSkin = document.createElement('img');
    snakeSkin.setAttribute('src', 'Snake_Skin.png');
    snakeElement.appendChild(snakeSkin);
  });
}

//https://github.com/filipeportes/snake-game/issues/1
//https://stackoverflow.com/questions/50776164/javascript-snake-collision-understanding
//https://codeincomplete.com/articles/starting-snakes/
function onSnake(position, { ignoreHead = false } = {}) {
  return snakeBody.some((segment, index) => {
    if (ignoreHead && index === 0) return false;
    return equalPositions(segment, position);
  });
}

function getSnakeHead() {
  return snakeBody[0];
}

function snakeIntersection() {
  return onSnake(snakeBody[0], { ignoreHead: true });
}

function equalPositions(pos1, pos2) {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

function expandSnake() {
  newSegments++;      // Currently one segment is added to snake. To add x segments, use newSegments =+ x
  appleBite.play();
  gameScore();
}

function addSegments() {
  for (let i = 0; i < newSegments; i++) {
    snakeBody.push({ ...snakeBody[snakeBody.length - 1] });
  }

  newSegments = 0;
}

/*****************************GRID*****************************/
function randomGridPosition() {
  return {
    x: Math.floor(Math.random() * 21) + 1,
    y: Math.floor(Math.random() * 21) + 1,
  };
}

function outsideGrid(position) {
  return (
    position.x < 1 || position.x > 21 ||
    position.y < 1 || position.y > 21
  );
}

/*****************************FOOD*****************************/
let food = getRandomFoodPosition();

function updateFood() {
  if (onSnake(food)) {
    expandSnake();
    food = getRandomFoodPosition();
  }
}

function drawFood(gameBoard) {
  let foodElement = document.createElement('div');
  foodElement.style.gridRowStart = food.y;
  foodElement.style.gridColumnStart = food.x;
  foodElement.classList.add('food');
  gameBoard.appendChild(foodElement);

  let apple = document.createElement('img');
  apple.setAttribute('src', 'apple.png');
  foodElement.appendChild(apple);
}

function getRandomFoodPosition() {
  let newFoodPosition;
  while (newFoodPosition == null || onSnake(newFoodPosition)) {
    newFoodPosition = randomGridPosition();
  }

  return newFoodPosition;
}

/*****************************GAME*****************************/
let gameOver = false;
let score = 0;
const gameBoard = document.getElementById('game-board');
const scoreCounter = document.getElementById('score');

const appleBite = new Audio('AppleBite.mp3');
const crashing = new Audio('Crashing.mp3');
const gamePlay = new Audio('GamePlay.wav');

gamePlay.loop = true;
gamePlay.volume = 0.3;

//https://www.w3schools.com/jsref/met_loc_reload.asp
//https://css-tricks.com/using-requestanimationframe/ - Alternative to SetInterval Function
function main() {

  let game = setInterval(function () {
    if (gameOver) {
      gamePlay.pause();
      clearInterval(game);
      crashing.play();
      if (confirm('You lost. Press ok to restart.')) {
        location.reload();
      }

      return;
    } else {
      gamePlay.play();
      updateSnake();
      updateFood();
      checkDeath();
      gameBoard.innerHTML = '';
      drawScore();
      drawSnake(gameBoard);
      drawFood(gameBoard);
    }
  }, 1000 / 5); // Snake move x time per second for 1000/x

}

function checkDeath() {
  gameOver = outsideGrid(getSnakeHead()) || snakeIntersection();
}

function drawScore() {
  scoreCounter.innerText = 'Score ' + score;
}

function gameScore() {
  score++;
  //console.log(score);
}

main(); //Calling the Function "main" to start the game
