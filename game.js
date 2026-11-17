
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
  { name: "토끼", emoji: "🐰", price: 0, color: "#f4d6b9", type: "rabbit" },
  { name: "공룡", emoji: "🦖", price: 20, color: "#62bd67", type: "dino" },
  { name: "기린", emoji: "🦒", price: 20, color: "#f3c84b", type: "giraffe" },
  { name: "코끼리", emoji: "🐘", price: 30, color: "#9caec0", type: "elephant" },
  { name: "사자", emoji: "🦁", price: 30, color: "#e6a64d", type: "lion" },
  { name: "판다", emoji: "🐼", price: 40, color: "#eeeeee", type: "panda" },
  { name: "고양이", emoji: "🐱", price: 40, color: "#f3a77b", type: "cat" },
  { name: "펭귄", emoji: "🐧", price: 40, color: "#53677d", type: "penguin" },
  { name: "호랑이", emoji: "🐯", price: 60, color: "#f39b35", type: "tiger" },
  { name: "여우", emoji: "🦊", price: 60, color: "#e98639", type: "fox" },
  { name: "원숭이", emoji: "🐵", price: 100, color: "#a96c43", type: "monkey" },
  { name: "유니콘", emoji: "🦄", price: 200, color: "#e9b5ef", type: "unicorn" }
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

function animalSVG(skin) {
  const c = skin.color;
  const type = skin.type;

  let ears = "";
  let extra = "";
  let tail = "";

  switch (type) {
    case "rabbit":
      ears = `
        <ellipse cx="73" cy="14" rx="8" ry="20" fill="${c}"/>
        <ellipse cx="91" cy="14" rx="8" ry="20" fill="${c}"/>
        <ellipse cx="73" cy="14" rx="3" ry="14" fill="#f5a8b8"/>
        <ellipse cx="91" cy="14" rx="3" ry="14" fill="#f5a8b8"/>
      `;
      tail = `<circle cx="12" cy="60" r="9" fill="white"/>`;
      break;

    case "dino":
      ears = `<path d="M67 27 L66 12 L78 23 L83 7 L92 25 L103 16 L101 35Z" fill="#389e54"/>`;
      tail = `<path d="M30 57 Q9 48 5 30 Q23 39 39 45Z" fill="${c}"/>`;
      extra = `<path d="M42 42 L50 36 L56 43 L63 37 L69 44" fill="#a4e78c"/>`;
      break;

    case "giraffe":
      ears = `<path d="M72 30 L72 5 Q81 -2 88 8 L88 38Z" fill="${c}"/>
      <circle cx="75" cy="5" r="4" fill="#9d692c"/>
      <circle cx="88" cy="5" r="4" fill="#9d692c"/>`;
      extra = `<circle cx="45" cy="48" r="5" fill="#a96b27"/>
      <circle cx="58" cy="65" r="5" fill="#a96b27"/>`;
      break;

    case "elephant":
      ears = `<ellipse cx="66" cy="39" rx="19" ry="23" fill="#8198b2"/>
      <ellipse cx="66" cy="39" rx="12" ry="16" fill="#e8a7b2"/>`;
      extra = `<path d="M96 39 Q116 43 107 63 Q104 73 96 65" fill="none" stroke="${c}" stroke-width="11" stroke-linecap="round"/>`;
      break;

    case "lion":
      ears = `<circle cx="82" cy="36" r="29" fill="#bd7937"/>
      <circle cx="82" cy="36" r="21" fill="${c}"/>`;
      break;

    case "panda":
      ears = `<circle cx="69" cy="20" r="10" fill="#252525"/>
      <circle cx="94" cy="20" r="10" fill="#252525"/>`;
      extra = `<ellipse cx="83" cy="57" rx="10" ry="12" fill="#252525"/>`;
      break;

    case "cat":
      ears = `<path d="M65 31 L65 5 L84 22 L99 5 L99 36Z" fill="${c}"/>`;
      tail = `<path d="M26 58 Q4 48 13 31" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`;
      break;

    case "penguin":
      extra = `<ellipse cx="83" cy="49" rx="17" ry="22" fill="white"/>
      <path d="M98 37 L113 43 L98 48Z" fill="#f5a52b"/>`;
      break;

    case "tiger":
      extra = `<path d="M70 42 L77 51 L72 59 M92 42 L86 51 L93 58" stroke="#4a3020" stroke-width="5" fill="none"/>`;
      break;

    case "fox":
      ears = `<path d="M65 32 L63 4 L82 24 L101 4 L100 34Z" fill="${c}"/>`;
      tail = `<path d="M29 58 Q7 51 9 29 Q26 36 38 46Z" fill="${c}"/>`;
      break;

    case "monkey":
      ears = `<circle cx="66" cy="36" r="13" fill="#98603d"/>
      <circle cx="100" cy="36" r="13" fill="#98603d"/>`;
      tail = `<path d="M27 57 Q7 53 10 32 Q13 21 21 30" fill="none" stroke="${c}" stroke-width="8"/>`;
      break;

    case "unicorn":
      ears = `<path d="M77 24 L86 -2 L94 27Z" fill="#f4d35e"/>
      <path d="M65 28 Q62 10 77 14 Q90 4 101 24" fill="#d98be9"/>`;
      tail = `<path d="M27 57 Q8 46 13 29" stroke="#d98be9" stroke-width="10" fill="none"/>`;
      break;
  }

  const body = `
    <ellipse cx="47" cy="57" rx="29" ry="21" fill="${c}"/>
    <ellipse cx="43" cy="48" rx="17" ry="10" fill="white" opacity=".18"/>
    <path d="M29 68 L27 85 L42 87 L40 67Z" fill="${c}"/>
    <path d="M54 68 L54 86 L68 86 L65 66Z" fill="${c}"/>
    <ellipse cx="34" cy="89" rx="9" ry="4" fill="#51413b"/>
    <ellipse cx="61" cy="89" rx="9" ry="4" fill="#51413b"/>
    <ellipse cx="83" cy="38" rx="20" ry="19" fill="${c}"/>
  `;

  const face = `
    <circle cx="91" cy="33" r="3.2" fill="#302820"/>
    <circle cx="92" cy="32" r="1" fill="white"/>
    <ellipse cx="101" cy="43" rx="7" ry="5" fill="${c}"/>
    <circle cx="106" cy="42" r="2.5" fill="#49352f"/>
    <circle cx="96" cy="48" r="4" fill="#f49ca5" opacity=".65"/>
  `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 100"
      width="100%" height="100%">
      ${tail}
      ${ears}
      ${body}
      ${extra}
      ${face}
    </svg>
  `;
}

function applySkin() {
  player.innerHTML = animalSVG(skins[selectedSkin]);
}

function updateWorld() {
  const worlds = [
    { score: 0, className: "world-meadow", name: "🌼 초원 세계" },
    { score: 30, className: "world-candy", name: "🍭 사탕 세계" },
    { score: 50, className: "world-winter", name: "❄️ 눈꽃 세계" },
    { score: 100, className: "world-night", name: "🌙 밤하늘 세계" }
  ];

  const world = [...worlds]
    .reverse()
    .find(item => score >= item.score);

  game.classList.remove(
    "world-meadow",
    "world-candy",
    "world-winter",
    "world-night"
  );

  game.classList.add(world.className);

  const label = document.getElementById("worldLabel");

  if (label) {
    label.textContent = world.name;
  }
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
  spawnTimer = 0;
  coinTimer = 0;
  score = 0;
  playerY = 0;
  velocity = 0;
  jumping = false;

  speed = 5;
  spawnTimer = 0;
  coinTimer = 0;

  player.style.bottom = groundHeight + "px";

  player.classList.remove(
    "is-jumping",
    "is-happy",
    "is-sad"
  );

  scoreText.textContent = "0";
  message.textContent = "";

  updateWorld();

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

    player.classList.add("is-jumping");
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

function collectCoin(entity) {
  coins++;

  coinsText.textContent = coins;

  localStorage.setItem("jumpCoins", coins);

  player.classList.add("is-happy");

  setTimeout(() => {
    player.classList.remove("is-happy");
  }, 700);

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

  // 코인은 장애물이 아니므로 충돌로 게임을 멈추지 않음
    continue;
  }

    if (entity.type === "pit") {
      const overlaps =
        p.left + 8 < o.right - 8 &&
        p.right - 8 > o.left + 8;

  // 구덩이에 실제로 걸쳐 있고
  // 캐릭터가 땅에 착지했을 때 게임 오버
      if (overlaps && playerY <= 2 && !jumping) {
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

  const dt = Math.min((time - lastTime) / 16.67, 2);
  lastTime = time;

  // 점프 물리
  if (jumping) {
    playerY += velocity * dt;
    velocity -= gravity * dt;

    if (playerY <= 0 && velocity < 0) {
      playerY = 0;
      velocity = 0;
      jumping = false;
      player.classList.remove("is-jumping");
    }
  }

  player.style.bottom =
    (groundHeight + playerY) + "px";

  // 장애물 생성
  spawnTimer += dt;
  coinTimer += dt;

  const spawnInterval = Math.max(65, 105 - score * 1.5);

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
    entity.element.style.left = entity.x + "px";

    if (entity.x + entity.width < 0 && entity.type !== "coin") {
      if (entity.type === "obstacle") {
        score++;
        scoreText.textContent = score;
        updateWorld();

        if (score % 3 === 0) {
          coins++;
          coinsText.textContent = coins;
          localStorage.setItem("jumpCoins", coins);
        }
      }

      entity.element.remove();
      entities = entities.filter(item => item !== entity);
    }

    if (entity.type === "coin" && entity.x < -40) {
      entity.element.remove();
      entities = entities.filter(item => item !== entity);
    }
  }

  speed = Math.min(5 + score * 0.12, 11);

  checkCollision();

  if (gameOver) return;

  animationId = requestAnimationFrame(update);
}

// 게임 종료

function endGame() {
  gameOver = true;

  cancelAnimationFrame(animationId);

  player.classList.remove(
    "is-jumping",
    "is-happy"
  );

  player.classList.add("is-sad");

  message.textContent =
    "💔 게임 오버! 다시 도전해 봐!";

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
