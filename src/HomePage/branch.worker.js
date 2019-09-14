
function centerDistance(x, y) {
    return Math.round(Math.sqrt(Math.pow(0 - x, 2) + Math.pow(0 - y, 2)));
}

function generateBranches(angleArea, tilt, length, ox, oy, x, y, branches, branchArray, width, height, config) {

    for (let b = 0; b < branches; b++) {

        // let newAngle = Math.round(Math.atan2(newY+ox, newX+oy)*180/Math.PI);

        let angle = (2 * Math.PI) / branches * b + angleArea / 2 + tilt;

        if (ox !== x || oy !== y) {
            let vx = x - ox;
            let vy = y - oy;

            let centerAngle = Math.atan2(vy, vx);

            let lowerBound = centerAngle - angleArea / 2;
            let upperBound = centerAngle + angleArea / 2;

            let bCoef = (branches <= 1) ? angleArea / 2 : angleArea / (branches - 1);

            // console.log(bCoef);

            angle = (branches <= 1) ? bCoef + lowerBound : bCoef * b + lowerBound;
        }

        // let angle = (2*Math.PI)/branches*b + angleArea/2 + tilt;
        let newX = Math.round(Math.cos(angle) * length) + x;
        let newY = Math.round(Math.sin(angle) * length) + y;

        let angleAreaDegrees = angleArea * 180 / Math.PI;


        // nothing can be behind the point
        if (config.hasOwnProperty('allowBranchesToGoBackward') && config.allowBranchesToGoBackward === true) {
        } else if(centerDistance(newX, newY) - centerDistance(x, y) < 0) continue;

        // nothing can go directly backwards
        // if(centerDistance(newX, newY) - centerDistance(x,y) < -length/2) continue;

        branchArray.push({
            newX,
            newY,
            x,
            y,
            length
        });

        // draw line for branch
        // ctx.moveTo(x, y);
        // ctx.lineTo(newX, newY);
        //
        // ctx.clearRect(-width/2, -height/2, width, height);
        // ctx.stroke();
    }
}

self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
    if (!e) return;

    const {
        branchMemoryArray,
        width,
        height,
        branches, // max number
        length,
        angleArea,
    } = e.data;

    let branchArray = [];
    for(let b in branchMemoryArray) {
        let branch = branchMemoryArray[b];
        let x = branch.x;
        let y = branch.y;
        let mx = branch.newX;
        let my = branch.newY;

        let tilt = Math.atan2(my, mx) - Math.atan2(y, x);

        // TODO make this threaded
        generateBranches(angleArea, tilt, length, x, y, mx, my, branches, branchArray, width, height, e.data);
    }

    postMessage(branchArray);
});
