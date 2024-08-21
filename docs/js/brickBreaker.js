

const config = {
    field:{
        width:540,
        height:360,
    },
    block:{
        rowCount:6,
        colCount:5,
        style:{
            width:80,
            height:20,
        },
        margin:10,
    },
    ball:{
        radius:10,
        speed:3,
        angle:Math.random()*70+10,
    },
};

const obj = {};

function init(){
    // 既存blockの削除


    // blockの設置
    obj.blocks = generateBlocks(config.block.rowCount, config.block.colCount);

    // ballの設置
    obj.ball = generateBall();

}

function generateBlock(fieldWidth, rowCount, colCount, r, c){
    const block = document.createElement('div');
    block.classList.add('block');

    const blockWidth = (fieldWidth - config.block.margin * (colCount + 1) - 2 * colCount) / colCount ;
    block.style.width = `${blockWidth}px`;
    block.style.height = `${config.block.style.height}px`;
    block.style.left = `${c * (blockWidth + config.block.margin + 2) + config.block.margin}px`; //borderSize*2=2
    block.style.top = `${r * (20 + config.block.margin) + config.block.margin}px`;

    return block;
}

function generateBlocks(rowCount, colCount){
    const field = document.getElementById('field');
    const blocks = [];

    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
            const block = generateBlock(field.clientWidth, rowCount, colCount, r, c);
            field.append(block);
            blocks.push(block);
        }
    }
    return blocks;
}

function generateBall(){
    const field = document.getElementById('field');

    const ball = document.createElement('div');
    ball.setAttribute('id','ball');
    ball.style.width = `${config.ball.radius * 2}px`;
    ball.style.height = `${config.ball.radius * 2}px`;
    ball.style.left = `${0}px`;
    ball.style.top = `${50}px`;

    field.append(ball);
    return ball;
}

function doTick(){
    setInterval(()=>{
        // 移動
        const dPos = nomalizeVector(config.ball.angle, config.ball.speed)
        moveBall(dPos.x, dPos.y);


        // 反転チェック
        checkInvert();

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

function moveBall(dx, dy){
    const pos = getPosOf(obj.ball);
    obj.ball.style.left = `${pos.x + dx}px`;
    obj.ball.style.top = `${pos.y + dy}px`;
}

function nomalizeVector(angle, speed){
    const radian = angle * (Math.PI / 180);
    return {
        x:Math.sin(radian) * speed,
        y:Math.cos(radian) * speed,
    };
}

function checkInvert(){
    const pos = getPosOf(obj.ball);
    const dPos = nomalizeVector(config.ball.angle, config.ball.speed);
    if(pos.x < 0 || config.field.width - config.ball.radius * 2 < pos.x + dPos.x){
        config.ball.angle = -config.ball.angle;
    }
    if(pos.y < 0 || config.field.height - config.ball.radius * 2 < pos.y + dPos.y){
        config.ball.angle = (180 - config.ball.angle) % 360;
    }
}




init();

doTick();