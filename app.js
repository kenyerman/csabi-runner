let sceneCounter = 0;

const nextScene = () => {
    // document.getElementById(`scene-${sceneCounter}`).classList.remove('active');
    sceneCounter++;
    document.getElementById(`scene-${sceneCounter}`).classList.add('active');

    if (sceneCounter === 2) {
        characterAnimation(undefined);
    }
}

let speed = 200;
let score = 0;

let laneSwitchTime;
let currentLane = 'center';
let direction;

let lastFrameTime;
let lastRunningTime;
let lastSpeedTime;
let lastEntityTime;
let frame = 0;

let mapOffset = 0;

let ended = false;

const randChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

const characterAnimation = (timestamp) => {
    if (ended) {
        return
    }

    if (speed < (timestamp - laneSwitchTime)) {
        direction = undefined;
    }

    if (speed < (timestamp - (lastRunningTime || 0))) {
        frame = (frame + 1) % 4;
        lastRunningTime = timestamp;
        mapOffset = (mapOffset + 1) % 100;
    }

    if (100 < timestamp - (lastSpeedTime || 0)) {
        speed = Math.max(speed - 1, 30);
        lastSpeedTime = timestamp;
    }

    if ((500 + (speed * 2)) < timestamp - (lastEntityTime || 0)) {
        if (lastEntityTime) {
            addEntity(
                randChoice(['left', 'center', 'right']),
                randChoice(['money','money','money', 'bigmoney', 'flipflop']),
            )
        }

        lastEntityTime = timestamp;
    }

    lastFrameTime = timestamp;

    const img = document.getElementById('character');

    const width = 100;
    const height = 150;
    const dx = 0;
    const dy =  0;


    const row = frame;
    let col = 1;

    if (direction === 'left') {
        col = 2;
    }

    if (direction === 'right') {
        col = 3;
    }

    const clip = `polygon(${(row*width) + dx}px ${(col*height) + dy}px, ${((row+1)*width) + dx}px ${(col*height) + dy}px, ${((row+1)*width) + dx}px ${((col+1)*height) + dy}px, ${(row*width) + dx}px ${((col+1)*height) + dy}px)`;
    const transform = `translateX(-${row*width}px) translateY(-${col*height}px)`

    img.style.clipPath = clip;
    img.style.transform = transform;
    img.style.transitionDuration = speed * 2 + 'ms';

    const maps = document.getElementsByClassName('map');
    for(let i = 0; i < maps.length; ++i) {
        maps[i].style.backgroundPositionY = (mapOffset * 2) + '%';
    }

    document.getElementById('speed').textContent = Math.round(5000 / (speed || 1));
    document.getElementById('score').textContent = score;

    window.requestAnimationFrame(characterAnimation);
}

const switchLane = (lane) => {
    const img = document.getElementById('character');

    if (img.classList.contains('left') && lane === 'left') {
        return;
    }

    if (img.classList.contains('center') && lane === 'center') {
        return;
    }

    if (img.classList.contains('right') && lane === 'right') {
        return;
    }

    if (img.classList.contains('left')) {
        direction = 'right'
    }

    if (img.classList.contains('center')) {
        direction = lane;
    }

    if (img.classList.contains('right')) {
        direction = 'left';
    }

    img.classList.remove('left', 'center', 'right');
    img.classList.add(lane);
    laneSwitchTime = lastFrameTime;
    currentLane = lane;

    addEntity(lane, 'bigmoney');
}

const addEntity = (lane, name) => {
    const element = document.createElement('img');
    element.src = `/assets/${name}.png`;
    element.className = 'entity ' + lane;

    element
        .animate([
                {bottom: '100vh'},
                {bottom: '0'}
            ],
            speed * 30
        )
        .onfinish = () => {
            if (lane === currentLane) {
                if (name === 'flipflop') {
                    gameOver();
                    nextScene();
                }

                if (name === 'money') {
                    addScore(10);
                }

                if (name === 'bigmoney') {
                    addScore(50);
                }
            }

            element.remove();
        };

    document.getElementById('scene-2').appendChild(element);
}

const gameOver = () => {
    ended = true;
    document.getElementById('score-2').textContent = score;
}

const youWin = () => {
    ended = true;
    document.getElementById('score-3').textContent = score;
}

const addScore = (increment) => {
    score += increment;

    const element = document.createElement('div');
    element.className = 'instant-score';
    element.textContent = '+' + increment;

    element
        .animate(
            [
                {opacity: 1},
                {opacity: 0}
            ],
            speed * 4
        )
        .onfinish = () => {
            element.remove();
        };

    document.getElementById('scene-2').appendChild(element);

    if (5000 <= score) {
        youWin();
        document.getElementById(`scene-4`).classList.add('active');
    }
}

const retry = () => {
    window.location.reload();
}
