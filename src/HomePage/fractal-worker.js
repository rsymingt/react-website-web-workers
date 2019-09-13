

export default () => {
    function centerDistance(x, y) {
        return Math.round(Math.sqrt(Math.pow(0-x, 2) + Math.pow(0-y, 2)));
    }

// TODO randomize direction?
    function generateBranches( canvas, ctx, angleArea, tilt, length, ox, oy, x, y, branches, branchArray, width, height) {

        for(let b = 0; b < branches; b ++) {

            // let newAngle = Math.round(Math.atan2(newY+ox, newX+oy)*180/Math.PI);

            let angle = (2*Math.PI)/branches*b + angleArea/2 + tilt;

            if(ox !== x || oy !== y) {
                let vx = x - ox;
                let vy = y - oy;

                let centerAngle = Math.atan2(vy, vx);

                let lowerBound = centerAngle - angleArea/2;
                let upperBound = centerAngle + angleArea/2;

                let bCoef = angleArea/(branches-1);

                // console.log(bCoef);

                angle = bCoef*b + lowerBound;
            }

            // let angle = (2*Math.PI)/branches*b + angleArea/2 + tilt;
            let newX = Math.round(Math.cos(angle)*length) + x;
            let newY = Math.round(Math.sin(angle)*length) + y;

            let angleAreaDegrees = angleArea*180/Math.PI;


            // nothing can be behind the point
            // if(centerDistance(newX, newY) - centerDistance(x,y) < 0) continue;

            // nothing can go directly backwards
            // if(centerDistance(newX, newY) - centerDistance(x,y) < -length/2) continue;

            branchArray.push({
                newX,
                newY,
                x,
                y
            });

            // draw line for branch
            // ctx.moveTo(x, y);
            // ctx.lineTo(newX, newY);
            //
            // ctx.clearRect(-width/2, -height/2, width, height);
            // ctx.stroke();
        }
    }

    function trippyDrawBranches( canvas, ctx, branchArray, width, height, timeDiff ) {

        for(let b in branchArray) {
            const { x, y, newX, newY } = branchArray[b];

            ctx.moveTo(x, y);
            ctx.lineTo(timeDiff*newX, timeDiff*newY);

            ctx.clearRect(-width/2, -height/2, width, height);
            ctx.stroke();
        }

    }

    function drawBranches( canvas, ctx, branchArray, width, height, timeDiff ) {
        for(let b in branchArray) {
            const { x, y, newX, newY } = branchArray[b];

            ctx.moveTo(x, y);
            ctx.lineTo(timeDiff*(newX - x) + x, timeDiff*(newY - y) + y);

            ctx.clearRect(-width/2, -height/2, width, height);
            ctx.stroke();
        }

        const bitmap = canvas.transferToImageBitmap();
        postMessage({bitmap})
    }

    function animateBranches( canvas, ctx, angleArea, length, x, y, branches, branchArray, width, height, depth, time, branchMemoryArray, trippy ) {

        let timeDiff = ((new Date()).getTime() - time.getTime())/1000;
        // timeDiff=1;

        if(trippy) {
            trippyDrawBranches(canvas, ctx, branchArray, width, height, timeDiff);
        } else {
            drawBranches(canvas, ctx, branchArray, width, height, timeDiff);
        }

        // console.log(timeDiff);
        if(timeDiff >= 1) {
            let newX = branchArray[0].newX;
            let newY = branchArray[0].newY;
            drawFractal(
                canvas,
                ctx,
                branchArray,
                x,
                y,
                newX,
                newY,
                angleArea,
                depth+1,
                0,
                width,
                height
            );
        } else {
            requestAnimationFrame(() => {
                animateBranches( canvas, ctx, angleArea, length, x, y, branches, branchArray, width, height, depth, time, branchMemoryArray)
            });
        }
    }

    function animateBranch( canvas, ctx, x, y, newX, newY, width, height, timeDiff, time ) {


        ctx.moveTo(x, y);
        ctx.lineTo(timeDiff*(newX - x) + x, timeDiff*(newY - y) + y);

        ctx.clearRect(-width/2, -height/2, width, height);
        ctx.stroke();

        const bitmap = canvas.transferToImageBitmap();
        postMessage({bitmap})
    }

// angleArea <= 90
    /*
    determine branch direction
    determine branch
    (pseudo) randomize number of branches?
    pseudo randomize direction of branches?
     */
    async function drawFractal( canvas, ctx, branchMemoryArray, ox, oy, x, y, angleArea, depth, branch, width, height ) {
        if(Math.abs(x) < width/2 && Math.abs(y) < height/2) {

            if(depth > 3) return;

            let branches = (branch === -1) ? Math.round(Math.random()*5 + 3) : Math.round(Math.random()*4 + 2);
            let length = Math.random()*90 + 10;
            let branchArray = [];

            generateBranches(canvas, ctx, angleArea, 0, length, ox, oy, x, y, branches, branchArray, width, height);

            for(let b in branchMemoryArray) {
                let branch = branchMemoryArray[b];
                let x = branch.x;
                let y = branch.y;
                let mx = branch.newX;
                let my = branch.newY;

                let tilt = Math.atan2(my, mx) - Math.atan2(y, x);

                generateBranches(canvas, ctx, angleArea, tilt, length, x, y, mx, my, branches, branchArray, width, height);
            }

            requestAnimationFrame(() => {
                animateBranches( canvas, ctx, angleArea, length, x, y, branches, branchArray, width, height, depth, new Date(), branchMemoryArray)
            });


        } else {

        }
    }

    async function animateFractal( canvas ) {
        const ctx = canvas.getContext('2d');

        const width = canvas.width;
        const height = canvas.height;

        ctx.translate(width/2, height/2);

        ctx.beginPath();

        // randomize??
        ctx.strokeStyle = 'rgba(0, 153, 255, 1)';

        drawFractal(canvas, ctx, [], 0, 0, 0, 0, Math.PI/2, 0, -1, width, height);

        ctx.closePath();
    }

    self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
        if (!e) return;

        const canvas = e.data.canvas;
        animateFractal(canvas);
    })
}