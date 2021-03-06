//根据起点终点返回方向 1向上 2向下 3向左 4向右 0未滑动
export function getDirection(startx, starty, endx, endy) {
    let angx = endx - startx;
    let angy = endy - starty;
    let result = 0;

    //如果滑动距离太短
    if (Math.abs(angx) < 2 && Math.abs(angy) < 2) {
        return result;
    }

    let angle = getAngle(angx, angy);
    if (angle >= -135 && angle <= -45) {
        result = 1;
    } else if (angle > 45 && angle < 135) {
        result = 2;
    } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
        result = 3;
    } else if (angle >= -45 && angle <= 45) {
        result = 4;
    }

    return result;
}

function getAngle(angx, angy) {
    return Math.atan2(angy, angx) * 180 / Math.PI;
}

export function arrDeepCopy(source){
    let sourceCopy = [];
    for (let item in source) sourceCopy[item] = typeof source[item] === 'object' ? arrDeepCopy(source[item]) : source[item];
    return sourceCopy;
}


export function getQueryVariable(variable) {
    const query = window.location.search.substring(1);
    const vars = query.split("&");
    for (let i=0;i < vars.length;i++) {
        let pair = vars[i].split("=");
        if (pair[0] === variable){
            return pair[1]
        }
    }
    return false;
}
