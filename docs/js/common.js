

function setWidthOf(obj, val){
    obj.style.width = `${val}px`;
}
function getWidthOf(obj){
    console.log(obj.style.width)
    return Number(obj.offsetWidth.replace('px', ''));
}

function setLeftOf(obj, val){
    obj.style.left = `${val}px`;
}
function getLeftOf(obj){
    return Number(obj.style.left.replace('px', ''));
}

function setTopOf(obj, val){
    obj.style.top = `${val}px`;
}
function getTopOf(obj){
    return Number(obj.style.top.replace('px', ''));
}

function setPosOf(obj, pos){
    setLeftOf(obj, pos.left)
    setTopOf(obj, pos.top)
}
function getPosOf(obj){
    return {
        left:Number(getLeftOf(obj)),
        top:Number(getTopOf(obj)),
    };
}
