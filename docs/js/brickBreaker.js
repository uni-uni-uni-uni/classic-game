

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

function doTick(){
    setInterval(()=>{
        // 移動
        const dPos = nomalizeVector(config.ball.angle, config.ball.speed)
        moveBall(dPos.x, dPos.y);

        // ブロック衝突判定
        const targetIndex = checkCollision();
        if(targetIndex != null){
            obj.blocks[targetIndex].remove();
            obj.blocks.splice(targetIndex, 1);
        }

        // 壁衝突判定
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

function checkCollision(){
    const pos = getPosOf(obj.ball);
    const dPos = nomalizeVector(config.ball.angle, config.ball.speed);
    pos.x = pos.x + dPos.x + config.ball.radius;
    pos.y = pos.y + dPos.y + config.ball.radius;

    for (let i = 0; i < obj.blocks.length; i++) {
        const block = obj.blocks[i];
        const blockStartPos = getPosOf(block);
        const blockEndPos = {
            x:blockStartPos.x + config.block.style.width,
            y:blockStartPos.y + config.block.style.height,
        };

        let socre = 0;
        if(pos.x < blockStartPos.x){
            socre = socre + 1;
        }
        if(pos.y < blockStartPos.y){
            socre = socre + 2;
        }
        if(pos.x > blockEndPos.x){
            socre = socre + 4;
        }
        if(pos.y > blockEndPos.y){
            socre = socre + 8;
        }

        if(socre == 1){
            if(distance(pos.x, 0, blockStartPos.x, 0) < config.ball.radius){
                config.ball.angle = -config.ball.angle;
                return i;
            }
        }else if(socre == 2){
            if(distance(0, pos.y, 0, blockStartPos.y) < config.ball.radius){
                config.ball.angle = (180 - config.ball.angle) % 360;
                return i;
            }
        }else if(socre == 3){
            if(distance(pos.x, pos.y, blockStartPos.x, blockStartPos.y) < config.ball.radius){
                if((blockStartPos.x - pos.x) - (blockStartPos.y - pos.y) < 0){
                    config.ball.angle = (180 - config.ball.angle) % 360;
                }else{
                    config.ball.angle = -config.ball.angle;
                }
                return i;
            }
        }else if(socre == 4){
            if(distance(pos.x, 0, blockEndPos.x, 0) < config.ball.radius){
                config.ball.angle = -config.ball.angle;
                return i;
            }
        }else if(socre == 6){
            if(distance(pos.x, pos.y, blockEndPos.x, blockStartPos.y) < config.ball.radius){
                if((pos.x - blockEndPos.x) - (blockStartPos.y - pos.y) < 0){
                    config.ball.angle = (180 - config.ball.angle) % 360;
                }else{
                    config.ball.angle = -config.ball.angle;
                }
                return i;
            }
        }else if(socre == 8){
            if(distance(0, pos.y, 0, blockEndPos.y) < config.ball.radius){
                config.ball.angle = (180 - config.ball.angle) % 360;
                return i;
            }
        }else if(socre == 9){
            if(distance(pos.x, pos.y, blockStartPos.x, blockEndPos.y) < config.ball.radius){
                if((blockStartPos.x - pos.x) - (pos.y - blockEndPos.y) < 0){
                    config.ball.angle = (180 - config.ball.angle) % 360;
                }else{
                    config.ball.angle = -config.ball.angle;
                }
                return i;
            }
        }else if(socre == 12){
            if(distance(pos.x, pos.y, blockEndPos.x, blockEndPos.y) < config.ball.radius){
                if((pos.x - blockEndPos.x) - (pos.y - blockEndPos.y) < 0){
                    config.ball.angle = (180 - config.ball.angle) % 360;
                }else{
                    config.ball.angle = -config.ball.angle;
                }
                return i;
            }
        }
    }
    return null;
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