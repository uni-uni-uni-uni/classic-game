

const config = {
    game:{
        phase:'start',
        maxLife:3,
        life:0,
    },
    field:{
        width:540,
        height:360,
    },
    block:{
        rowCount:6,
        colCount:5,
        style:{
            width:93,
            height:20,
        },
        marginVertical:10,
    },
    ball:{
        radius:10,
        defaultSpeed:3,
        speed:0,
        angle:Math.random()*140+110,
    },
    bar:{
        style:{
            width:80,
            height:20,
        },
        speed:3,
        rightKey:0,
        leftKey:0,
    },
};

const obj = {};

function init(){
    // config初期化
    config.ball.speed = config.ball.defaultSpeed;
    config.game.life = config.game.maxLife;

    // 既存blockの削除
    while (field.firstChild) {
        field.removeChild(field.firstChild);
    }

    // blockの設置
    obj.blocks = createBlocks(config.block.rowCount, config.block.colCount);

    // ballの設置
    obj.ball = createBall();

    // barの設置
    obj.bar = createBar();

    // lifeの設置
    obj.life = createLife();

}

function createBlock(fieldWidth, rowCount, colCount, r, c){
    const block = document.createElement('div');
    block.classList.add('block');

    block.style.width = `${config.block.style.width}px`;
    block.style.height = `${config.block.style.height}px`;
    const marginHorizontal = (fieldWidth - (config.block.style.width + 2) * colCount) / (colCount + 1); //borderSize*2=2
    block.style.left = `${c * (config.block.style.width + marginHorizontal + 2) + marginHorizontal}px`; //borderSize*2=2
    block.style.top = `${r * (20 + config.block.marginVertical) + config.block.marginVertical}px`;

    return block;
}

function createBlocks(rowCount, colCount){
    const field = document.getElementById('field');
    const blocks = [];

    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
            const block = createBlock(field.clientWidth, rowCount, colCount, r, c);
            field.append(block);
            blocks.push(block);
        }
    }
    return blocks;
}

function createBall(){
    const field = document.getElementById('field');

    const ball = document.createElement('div');
    ball.setAttribute('id','ball');
    ball.classList.add('ball');
    ball.style.width = `${config.ball.radius * 2}px`;
    ball.style.height = `${config.ball.radius * 2}px`;
    ball.style.left = `${(config.field.width - config.bar.style.width) / 2 + config.bar.style.width / 2 - config.ball.radius}px`;
    ball.style.top = `${config.field.height - config.bar.style.height - 10 - config.ball.radius * 2 - 1}px`;

    field.append(ball);
    return ball;
}

function createBar(){
    const field = document.getElementById('field');

    const bar = document.createElement('div');
    bar.setAttribute('id','bar');
    bar.style.width = `${config.bar.style.width}px`;
    bar.style.height = `${config.bar.style.height}px`;
    bar.style.left = `${(config.field.width - config.bar.style.width) / 2}px`;
    bar.style.top = `${config.field.height - config.bar.style.height - 10}px`;

    field.append(bar);
    return bar;
}

function createLife(){
    const field = document.getElementById('field');

    const life = document.createElement('div');
    life.setAttribute('id','life');
    life.style.top = `${config.field.height + 5}px`;

    for (let i = 0; i < config.game.maxLife; i++) {
        const ball = document.createElement('div');
        ball.classList.add('ball');
        ball.style.width = `${config.ball.radius * 2}px`;
        ball.style.height = `${config.ball.radius * 2}px`;
        life.append(ball);
    }

    field.append(life);
    return life;
}

function doTick(){
    setInterval(()=>{
        // 移動
        const dPos = nomalizeVector(config.ball.angle, config.ball.speed)
        moveBall(dPos.x, dPos.y);

        moveBar();

        // ブロック衝突判定
        const targetIndex = checkCollisionBlocks();
        if(targetIndex != null){
            obj.blocks[targetIndex].remove();
            obj.blocks.splice(targetIndex, 1);
            config.ball.speed = config.ball.speed + 0.1;
        }

        // フィールド衝突判定
        checkCollisionField();

        // バー衝突判定
        checkCollisionBar();

        // クリア判定
        checkClear();

        // 進行方向表示のための属性設定
        obj.ball.setAttribute('angle', Math.floor(((config.ball.angle+360)%360)))

    }, 1000 * 1 / 60);

}

function getLeftOf(obj){
    return Number(obj.style.left.replace('px', ''));
}

function getTopOf(obj){
    return Number(obj.style.top.replace('px', ''));
}

function getPosOf(obj){
    return {
        x:Number(getLeftOf(obj)),
        y:Number(getTopOf(obj)),
    };
}

function moveBall(){
    if(config.game.phase == 'ready'){
        setBallOnBar();
    }else if(config.game.phase == 'game'){
        const pos = getPosOf(obj.ball);
        const dPos = nomalizeVector(config.ball.angle, config.ball.speed)
        obj.ball.style.left = `${pos.x + dPos.x}px`;
        obj.ball.style.top = `${pos.y + dPos.y}px`;
    } 
}

function setBallOnBar() {
    obj.ball.style.left = `${getLeftOf(obj.bar) + config.bar.style.width / 2 - config.ball.radius}px`;
    obj.ball.style.top = `${getTopOf(obj.bar) - config.ball.radius * 2 - 1}px`;
}

function moveBar(){
    const nextLeft = getLeftOf(bar) + config.bar.speed * (config.bar.rightKey + config.bar.leftKey);

    if(nextLeft < 0 || config.field.width - config.bar.style.width < nextLeft ){
        return;
    }

    obj.bar.style.left = `${nextLeft}px`;
}

function checkCollisionBlocks(){
    const pos = getPosOf(obj.ball);
    const dPos = nomalizeVector(config.ball.angle, config.ball.speed);
    pos.x = pos.x + dPos.x + config.ball.radius;
    pos.y = pos.y + dPos.y + config.ball.radius;

    for (let i = 0; i < obj.blocks.length; i++) {
        const block = obj.blocks[i];
        const blockStartPos = getPosOf(block);

        const result = checkCollisionBallVsRect(blockStartPos, config.block.style);
        if(result.isCollision){
            config.ball.angle = result.angle;
            return i;
        }
    }
    return null;
}

function checkCollisionBallVsRect(rectStartPos, rectStyle){
    const pos = getPosOf(obj.ball);
    const dPos = nomalizeVector(config.ball.angle, config.ball.speed);
    pos.x = pos.x + dPos.x + config.ball.radius;
    pos.y = pos.y + dPos.y + config.ball.radius;
    const rectEndPos = {
        x:rectStartPos.x + rectStyle.width,
        y:rectStartPos.y + rectStyle.height,
    };

    let score = 0;
    if(pos.x < rectStartPos.x){
        score = score + 1;
    }
    if(pos.y < rectStartPos.y){
        score = score + 2;
    }
    if(pos.x > rectEndPos.x){
        score = score + 4;
    }
    if(pos.y > rectEndPos.y){
        score = score + 8;
    }

    if(score == 1){
        if(distance(pos.x, 0, rectStartPos.x, 0) < config.ball.radius){
            const angle = -config.ball.angle;
            return {isCollision:true, score:score, angle:angle};
        }
    }else if(score == 2){
        if(distance(0, pos.y, 0, rectStartPos.y) < config.ball.radius){
            const angle = (180 - config.ball.angle) % 360;
            return {isCollision:true, score:score, angle:angle};
        }
    }else if(score == 3){
        if(distance(pos.x, pos.y, rectStartPos.x, rectStartPos.y) < config.ball.radius){
            let angle = -config.ball.angle;
            if((rectStartPos.x - pos.x) - (rectStartPos.y - pos.y) < 0){
                config.ball.angle = (180 - config.ball.angle) % 360;
            }
            return {isCollision:true, score:score, angle:angle};
        }
    }else if(score == 4){
        if(distance(pos.x, 0, rectEndPos.x, 0) < config.ball.radius){
            const angle = -config.ball.angle;
            return {isCollision:true, score:score, angle:angle};
        }
    }else if(score == 6){
        if(distance(pos.x, pos.y, rectEndPos.x, rectStartPos.y) < config.ball.radius){
            let angle = -config.ball.angle;
            if((pos.x - rectEndPos.x) - (rectStartPos.y - pos.y) < 0){
                config.ball.angle = (180 - config.ball.angle) % 360;
            }
            return {isCollision:true, score:score, angle:angle};
        }
    }else if(score == 8){
        if(distance(0, pos.y, 0, rectEndPos.y) < config.ball.radius){
            const angle = (180 - config.ball.angle) % 360;
            return {isCollision:true, score:score, angle:angle};
        }
    }else if(score == 9){
        if(distance(pos.x, pos.y, rectStartPos.x, rectEndPos.y) < config.ball.radius){
            let angle = -config.ball.angle;
            if((rectStartPos.x - pos.x) - (pos.y - rectEndPos.y) < 0){
                config.ball.angle = (180 - config.ball.angle) % 360;
            }
            return {isCollision:true, score:score, angle:angle};
        }
    }else if(score == 12){
        if(distance(pos.x, pos.y, rectEndPos.x, rectEndPos.y) < config.ball.radius){
            let angle = -config.ball.angle;
            if((pos.x - rectEndPos.x) - (pos.y - rectEndPos.y) < 0){
                config.ball.angle = (180 - config.ball.angle) % 360;
            }
            return {isCollision:true, score:score, angle:angle};
        }
    }
    return {isCollision:false, score:score, angle:0};
}

function checkCollisionBar(){
    const result = checkCollisionBallVsRect(getPosOf(obj.bar), config.bar.style)
    if(result.isCollision){
        if(result.score == 2 || result.score == 3 || result.score == 6){
            // 上面の時、ボールがバーにぶつかる位置によって反射方向を変更
            const ballCenter = getLeftOf(obj.ball) + config.ball.radius;
            const barCenter = getLeftOf(obj.bar) + config.bar.style.width / 2;

            // 中心でぶるかると真上に反射し、左右に行くほど横方向に反射する
            const angle = 180 + 90 * (barCenter - ballCenter) / (config.bar.style.width / 2 + config.ball.radius);
            config.ball.angle = angle;
        }else{
            // 上面以外は普通に反射
            config.ball.angle = result.angle;
        }
    }

}

function distance(a,b,c,d){
    return ((c-a)**2 + (d-b)**2)**(1/2)
}

function nomalizeVector(angle, speed){
    const radian = angle * (Math.PI / 180);
    return {
        x:Math.sin(radian) * speed,
        y:Math.cos(radian) * speed,
    };
}

function checkCollisionField(){
    const pos = getPosOf(obj.ball);
    const dPos = nomalizeVector(config.ball.angle, config.ball.speed);
    if(pos.x < 0 || config.field.width - config.ball.radius * 2 < pos.x + dPos.x){
        config.ball.angle = -config.ball.angle;
    }
    if(pos.y < 0){
        config.ball.angle = (180 - config.ball.angle) % 360;
    }

    if(config.field.height - config.ball.radius * 2 < pos.y + dPos.y){
        misssed();
    }
}

function misssed() {
    config.ball.speed = 0;
    config.game.life--;
    if(life.firstChild) {
      life.removeChild(life.firstChild);
    }
    config.ball.angle = Math.random()*140+110;

    if(config.game.life<0){
        config.game.phase = 'gameover';
        gameover.style.display = 'block';
        config.bar.rightKey = 0;
        config.bar.leftKey = 0;

    }else{
        setTimeout(() => {
            setBallOnBar();
            config.game.phase = 'ready';
        }, 1000);
    }
}

function checkClear() {
    if(obj.blocks.length == 0){
        config.game.phase = 'gameover';
        clear.style.display = 'block';
        config.bar.rightKey = 0;
        config.bar.leftKey = 0;
    }
}

document.onkeydown = (e) =>{
    if(config.game.phase == 'ready' || config.game.phase == 'game'){
        if(e.code == 'ArrowRight' || e.code == 'KeyD'){
            config.bar.rightKey = 1;
        }else if(e.code == 'ArrowLeft' || e.code == 'KeyA'){
            config.bar.leftKey = -1;
        }
    }
    
    if(config.game.phase == 'ready'){
        if(e.code == 'Space'){
            config.game.phase = 'game';
            config.ball.speed = config.ball.defaultSpeed;
        }
    }
    
};

document.onkeyup = (e) =>{
    if(config.game.phase == 'ready' || config.game.phase == 'game'){
        if(e.code == 'ArrowRight' || e.code == 'KeyD'){
            config.bar.rightKey = 0;
        }else if(e.code == 'ArrowLeft' || e.code == 'KeyA'){
            config.bar.leftKey = 0;
        }
    }
};

const startBtnList = document.getElementsByClassName('start-button');
for (let i = 0; i < startBtnList.length; i++) {
    startBtnList[i].addEventListener('click', function(e){
        start.style.display = 'none';
        gameover.style.display = 'none';
        clear.style.display = 'none';
        config.game.phase = 'ready'
        init();
    });
}

init();

doTick();