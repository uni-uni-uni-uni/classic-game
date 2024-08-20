

const config = {
    block:{
        rowCount:6,
        colCount:5,
        style:{
            width:80,
            height:20,
        },
        margin:10,
    },
};


function init(){
    // 既存blockの削除


    // blockの設置
    generateBlocks(config.block.rowCount, config.block.colCount);
}

function generateBlock(fieldWidth, rowCount, colCount, r, c){
    const block = document.createElement('div');
    block.classList.add('block');

    const blockWidth = (fieldWidth - config.block.margin * (colCount + 1) - 2 * colCount) / colCount ;
    block.style.width = `${blockWidth}px`;
    block.style.height = `${config.block.style.height}px`;
    block.style.top = `${r * (20 + config.block.margin) + config.block.margin}px`;
    block.style.left = `${c * (blockWidth + config.block.margin + 2) + config.block.margin}px`; //borderSize*2=2

    return block;
}

function generateBlocks(rowCount, colCount){
    const field = document.getElementById('field');

    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
            const block = generateBlock(field.clientWidth, rowCount, colCount, r, c);
            field.append(block);
        }
    }
}


init();