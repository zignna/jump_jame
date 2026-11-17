
const player = document.getElementById("player");
const game = document.getElementById("game");
const objects = document.getElementById("gameObjects");

const scoreText = document.getElementById("score");
const bestText = document.getElementById("best");
const coinsText = document.getElementById("coins");
const message = document.getElementById("message");
const restartBtn = document.getElementById("restart");
const shop = document.getElementById("shop");

let playerY = 0;
let velocity = 0;
let jumping = false;
let gameOver = true;

let score = 0;
let coins = Number(localStorage.getItem("jumpCoins")) || 0;
let best = Number(localStorage.getItem("jumpBest")) || 0;

let speed = 5;
let lastTime = 0;
let animationId = null;

let entities = [];
let spawnTimer = 0;
let coinTimer = 0;

const groundHeight = 25;
const gravity = 0.65;
const jumpPower = 13;


const skins = [
  { name: "토끼", emoji: "🐰", price: 0 },
  { name: "공룡", emoji: "🦖", price: 20 },
  { name: "기린", emoji: "🦒", price: 20 },
  { name: "코끼리", emoji: "🐘", price: 30 },
  { name: "사자", emoji: "🦁", price: 30 },
  { name: "판다", emoji: "🐼", price: 40 },
  { name: "고양이", emoji: "🐱", price: 40 },
  { name: "펭귄", emoji: "🐧", price: 40 },
  { name: "호랑이", emoji: "🐯", price: 60 },
  { name: "여우", emoji: "🦊", price: 60 },
  { name: "원숭이", emoji: "🐵", price: 100 },
  { name: "유니콘", emoji: "🦄", price: 200 }
];


let ownedSkins = JSON.parse(
  localStorage.getItem("ownedSkins") || "[0]"
);

let selectedSkin = Number(
  localStorage.getItem("selectedSkin") || 0
);

coinsText.textContent = coins;
bestText.textContent = best;

// 스킨 적용
function applySkin() {
  player.textContent = skins[selectedSkin].emoji;
}

// 상점 만들기
function renderShop() {
  shop.innerHTML = "";

  skins.forEach((skin, index) => {
    const card = document.createElement("div");
    card.className = "skin";

    if (selectedSkin === index) {
      card.classList.add("selected");
    }

    const emoji = document.createElement("div");
    emoji.className = "emoji";
    emoji.textContent = skin.emoji;

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = skin.name;

    const price = document.createElement("div");
    price.className = "price";
    price.textContent =
      skin.price === 0 ? "무료" : "🪙 " + skin.price;

    const button = document.createElement("button");

    if (selectedSkin === index) {
      button.textContent = "사용 중";
      button.disabled = true;
    } else if (ownedSkins.includes(index)) {
      button.textContent = "장착하기";
    } else {
      button.textContent = "구매하기";
    }

    button.addEventListener("click", () => {
      if (ownedSkins.includes(index)) {
        selectedSkin = index;
        localStorage.setItem("selectedSkin", index);

        applySkin();
        renderShop();
        return;
      }

      if (coins >= skin.price) {
        coins -= skin.price;
        ownedSkins.push(index);

        localStorage.setItem("jumpCoins", coins);
        localStorage.setItem(
          "ownedSkins",
          JSON.stringify(ownedSkins)
        );

        selectedSkin = index;
        localStorage.setItem("selectedSkin", index);

        coinsText.textContent = coins;

        applySkin();
        renderShop();
      } else {
        alert("코인이 부족해요! 게임을 더 플레이해 보세요.");
      }
    });

    card.append(emoji, name, price, button);
    shop.appendChild(card);
  });
}

applySkin();
renderShop();

// 게임 시작
function startGame() {
  cancelAnimationFrame(animationId);

  entities.forEach(entity => entity.element.remove());
  entities = [];

  gameOver = false;
  score = 0;
  playerY = 0;
  velocity = 0;
  jumping = false;

  speed = 5;
  spawnTimer = 0;
  coinTimer = 0;

  player.style.bottom = groundHeight + "px";

  scoreText.textContent = "0";
  message.textContent = "";

  lastTime = performance.now();

  animationId = requestAnimationFrame(update);
}

// 점프
function jump() {
  if (gameOver) {
    startGame();
    return;
  }

  if (!jumping) {
    jumping = true;
    velocity = jumpPower;
  }
}

// 장애물 생성
function createObstacle() {
  const types = [
    { emoji: "🌵", width: 45 },
    { emoji: "🪨", width: 45 },
    { emoji: "🍄", width: 45 },
    { emoji: "🌳", width: 48 },
    { emoji: "🌵", width: 45 }
  ];

  const type = types[
    Math.floor(Math.random() * types.length)
  ];

  const element = document.createElement("div");
  element.className = "obstacle";
  element.textContent = type.emoji;

  element.style.left = game.clientWidth + "px";

  objects.appendChild(element);

  entities.push({
    type: "obstacle",
    element,
    x: game.clientWidth,
    width: type.width
  });
}

// 구덩이 생성
function createPit() {
  const width = 65 + Math.random() * 35;

  const element = document.createElement("div");
  element.className = "pit";

  element.style.width = width + "px";
  element.style.left = game.clientWidth + "px";

  objects.appendChild(element);

  entities.push({
    type: "pit",
    element,
    x: game.clientWidth,
    width
  });
}

// 코인 생성
function createCoin() {
  const element = document.createElement("div");
  element.className = "coin";
  element.textContent = "🪙";

  const height = 65 + Math.random() * 75;

  element.style.left = game.clientWidth + "px";
  element.style.bottom = height + "px";

  objects.appendChild(element);

  entities.push({
    type: "coin",
    element,
    x: game.clientWidth,
    y: height,
    width: 30
  });
}

// 코인 획득
function collectCoin(entity) {
  coins++;

  coinsText.textContent = coins;

  localStorage.setItem("jumpCoins", coins);

  entity.element.remove();

  entities = entities.filter(item => item !== entity);
}

// 충돌 확인
function checkCollision() {
  const p = player.getBoundingClientRect();

  const playerBox = {
    left: p.left + 12,
    right: p.right - 12,
    top: p.top + 8,
    bottom: p.bottom - 8
  };

  for (const entity of [...entities]) {
    const o = entity.element.getBoundingClientRect();

    if (entity.type === "coin") {
      const hit =
        playerBox.right > o.left &&
        playerBox.left < o.right &&
        playerBox.bottom > o.top &&
        playerBox.top < o.bottom;

      if (hit) {
        collectCoin(entity);
      }

      continue;
    }

    if (entity.type === "pit") {
      const overlaps =
        p.left + 8 < o.right &&
        p.right - 8 > o.left;

      // 구덩이 위에서 땅에 닿으면 게임 오버
      if (overlaps && playerY < 12) {
        endGame();
        return;
      }

      continue;
    }

    const collision =
      playerBox.right > o.left + 8 &&
      playerBox.left < o.right - 8 &&
      playerBox.bottom > o.top + 8 &&
      playerBox.top < o.bottom - 5;

    if (collision) {
      endGame();
      return;
    }
  }
}

// 게임 업데이트
function update(time) {
  if (gameOver) return;

  const dt = Math.min(
    (time - lastTime) / 16.67,
    2
  );

  lastTime = time;

  // 점프 물리
  if (jumping) {
    playerY += velocity * dt;
    velocity -= gravity * dt;

    if (playerY <= 0) {
      playerY = 0;
      velocity = 0;
      jumping = false;
    }
  }

  player.style.bottom =
    (groundHeight + playerY) + "px";

  // 장애물 생성
  spawnTimer += dt;
  coinTimer += dt;

  const spawnInterval = Math.max(
    65,
    105 - score * 1.5
  );

  if (spawnTimer >= spawnInterval) {
    spawnTimer = 0;

    if (Math.random() < 0.25) {
      createPit();
    } else {
      createObstacle();
    }
  }

  // 코인 생성
  if (coinTimer >= 65) {
    coinTimer = 0;
    createCoin();
  }

  // 오브젝트 이동
  for (const entity of [...entities]) {
    entity.x -= speed * dt;

    entity.element.style.left =
      entity.x + "px";

    // 화면 밖으로 나간 장애물
    if (
      entity.x + entity.width < 0 &&
      entity.type !== "coin"
    ) {
      if (entity.type === "obstacle") {
        score++;
        scoreText.textContent = score;

        // 장애물 통과 보너스 코인
        if (score % 3 === 0) {
          coins++;
          coinsText.textContent = coins;
          localStorage.setItem("jumpCoins", coins);
        }
      }

      entity.element.remove();
      entities = entities.filter(item => item !== entity);
    }

    // 화면 밖 코인 제거
    if (
      entity.type === "coin" &&
      entity.x < -40
    ) {
      entity.element.remove();
      entities = entities.filter(item => item !== entity);
    }
  }

  // 난이도 증가
  speed = Math.min(5 + score * 0.12, 11);

  checkCollision();

  if (gameOver) return;

  animationId = requestAnimationFrame(update);
}

// 게임 종료
function endGame() {
  gameOver = true;

  cancelAnimationFrame(animationId);

  message.textContent =
    "💥 게임 오버! 다시 도전해 봐!";

  if (score > best) {
    best = score;
    bestText.textContent = best;

    localStorage.setItem("jumpBest", best);
  }

  localStorage.setItem("jumpCoins", coins);
  coinsText.textContent = coins;
}

// 다시 시작
function restart() {
  startGame();
}

// 키보드 조작
document.addEventListener("keydown", e => {
  if (
    e.code === "Space" ||
    e.code === "ArrowUp"
  ) {
    e.preventDefault();

    if (!e.repeat) {
      jump();
    }
  }
});

// 마우스 및 터치 조작
game.addEventListener("pointerdown", e => {
  if (e.target !== restartBtn) {
    jump();
  }
});

restartBtn.addEventListener("click", restart);
