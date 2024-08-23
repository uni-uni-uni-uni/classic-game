

const config = {
    game:{
        isReady:true,
        maxLife:3,
        life:3,
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
        margin:10,
    },
    ball:{
        radius:10,
        defaultSpeed:3,
        speed:0,
        angle:Math.random()*150+100,
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
    // 既存blockの削除


    // blockの設置
    obj.blocks = generateBlocks(config.block.rowCount, config.block.colCount);

    // ballの設置
    obj.ball = generateBall();

    // barの設置
    obj.bar = generateBar();

}

function generateBlock(fieldWidth, rowCount, colCount, r, c){
    const block = document.createElement('div');
    block.classList.add('block');

    // const blockWidth = (fieldWidth - config.block.margin * (colCount + 1) - 2 * colCount) / colCount ;
    block.style.width = `${config.block.style.width}px`;
    block.style.height = `${config.block.style.height}px`;
    block.style.left = `${c * (config.block.style.width + config.block.margin + 2) + config.block.margin}px`; //borderSize*2=2
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
    ball.style.left = `${150}px`;
    ball.style.top = `${300}px`;

    field.append(ball);
    return ball;
}

function generateBar(){
    const field = document.getElementById('field');

    const bar = document.createElement('div');
    bar.setAttribute('id','bar');
    bar.style.width = `${config.bar.style.width}px`;
    bar.style.height = `${config.bar.style.height}px`;
    bar.style.left = `${config.field.width / 2}px`;
    bar.style.top = `${config.field.height - config.bar.style.height - 10}px`;

    field.append(bar);
    return bar;
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
        }

        // フィールド衝突判定
        checkCollisionField();

        // バー衝突判定
        checkCollisionBar();


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
    if(config.game.isReady){
        obj.ball.style.left = `${getLeftOf(obj.bar) + config.bar.style.width / 2 - config.ball.radius}px`;
        obj.ball.style.top = `${getTopOf(obj.bar) - config.ball.radius * 2}px`;
    }else{
        const pos = getPosOf(obj.ball);
        const dPos = nomalizeVector(config.ball.angle, config.ball.speed)
        obj.ball.style.left = `${pos.x + dPos.x}px`;
        obj.ball.style.top = `${pos.y + dPos.y}px`;
    }
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

        if(checkCollisionBallVsRect(blockStartPos, config.block.style)){
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

    let socre = 0;
    if(pos.x < rectStartPos.x){
        socre = socre + 1;
    }
    if(pos.y < rectStartPos.y){
        socre = socre + 2;
    }
    if(pos.x > rectEndPos.x){
        socre = socre + 4;
    }
    if(pos.y > rectEndPos.y){
        socre = socre + 8;
    }

    if(socre == 1){
        if(distance(pos.x, 0, rectStartPos.x, 0) < config.ball.radius){
            config.ball.angle = -config.ball.angle;
            return true;
        }
    }else if(socre == 2){
        if(distance(0, pos.y, 0, rectStartPos.y) < config.ball.radius){
            config.ball.angle = (180 - config.ball.angle) % 360;
            return true;
        }
    }else if(socre == 3){
        if(distance(pos.x, pos.y, rectStartPos.x, rectStartPos.y) < config.ball.radius){
            if((rectStartPos.x - pos.x) - (rectStartPos.y - pos.y) < 0){
                config.ball.angle = (180 - config.ball.angle) % 360;
            }else{
                config.ball.angle = -config.ball.angle;
            }
            return true;
        }
    }else if(socre == 4){
        if(distance(pos.x, 0, rectEndPos.x, 0) < config.ball.radius){
            config.ball.angle = -config.ball.angle;
            return true;
        }
    }else if(socre == 6){
        if(distance(pos.x, pos.y, rectEndPos.x, rectStartPos.y) < config.ball.radius){
            if((pos.x - rectEndPos.x) - (rectStartPos.y - pos.y) < 0){
                config.ball.angle = (180 - config.ball.angle) % 360;
            }else{
                config.ball.angle = -config.ball.angle;
            }
            return true;
        }
    }else if(socre == 8){
        if(distance(0, pos.y, 0, rectEndPos.y) < config.ball.radius){
            config.ball.angle = (180 - config.ball.angle) % 360;
            return true;
        }
    }else if(socre == 9){
        if(distance(pos.x, pos.y, rectStartPos.x, rectEndPos.y) < config.ball.radius){
            if((rectStartPos.x - pos.x) - (pos.y - rectEndPos.y) < 0){
                config.ball.angle = (180 - config.ball.angle) % 360;
            }else{
                config.ball.angle = -config.ball.angle;
            }
            return true;
        }
    }else if(socre == 12){
        if(distance(pos.x, pos.y, rectEndPos.x, rectEndPos.y) < config.ball.radius){
            if((pos.x - rectEndPos.x) - (pos.y - rectEndPos.y) < 0){
                config.ball.angle = (180 - config.ball.angle) % 360;
            }else{
                config.ball.angle = -config.ball.angle;
            }
            return true;
        }
    }
    return false;
}

function checkCollisionBar(){
    checkCollisionBallVsRect(getPosOf(obj.bar), config.bar.style)
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
        config.ball.speed = 0;
        config.game.life--;

        // if(config.game.life<0){
        //     alert("game over")
        //     config.game.life = config.game.maxLife;
        // }
        setTimeout(() => {
            config.game.isReady = true;
            config.ball.angle = Math.random()*150+100;
        }, 1000);
    }
}

document.onkeydown = (e) =>{
    if(e.code == 'ArrowRight'){
        config.bar.rightKey = 1;
    }else if(e.code == 'ArrowLeft'){
        config.bar.leftKey = -1;
    }else if(e.code == 'Space' && config.game.isReady){
        config.game.isReady = false;
        config.ball.speed = config.ball.defaultSpeed;
    }
    
};
document.onkeyup = (e) =>{
    if(e.code == 'ArrowRight'){
        config.bar.rightKey = 0;
    }else if(e.code == 'ArrowLeft'){
        config.bar.leftKey = 0;
    }
};

init();

doTick();