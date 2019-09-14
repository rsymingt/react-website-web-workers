
import BranchWorker from './branch.worker';

function centerDistance(x, y) {
    return Math.round(Math.sqrt(Math.pow(0 - x, 2) + Math.pow(0 - y, 2)));
}

// TODO randomize direction?
function generateBranches(canvas, ctx, angleArea, tilt, length, ox, oy, x, y, branches, branchArray, width, height) {

    for (let b = 0; b < branches; b++) {

        // let newAngle = Math.round(Math.atan2(newY+ox, newX+oy)*180/Math.PI);

        let angle = (2 * Math.PI) / branches * b + angleArea / 2 + tilt;

        if (ox !== x || oy !== y) {
            let vx = x - ox;
            let vy = y - oy;

            let centerAngle = Math.atan2(vy, vx);

            let lowerBound = centerAngle - angleArea / 2;
            let upperBound = centerAngle + angleArea / 2;

            let bCoef = angleArea / (branches - 1);

            // console.log(bCoef);

            angle = bCoef * b + lowerBound;
        }

        // let angle = (2*Math.PI)/branches*b + angleArea/2 + tilt;
        let newX = Math.round(Math.cos(angle) * length) + x;
        let newY = Math.round(Math.sin(angle) * length) + y;

        let angleAreaDegrees = angleArea * 180 / Math.PI;


        // nothing can be behind the point
        if (centerDistance(newX, newY) - centerDistance(x, y) < 0) continue;

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

function trippyDrawBranches(canvas, ctx, branchArray, width, height, timeDiff) {

    for (let b in branchArray) {
        const {x, y, newX, newY} = branchArray[b];

        ctx.moveTo(x, y);
        ctx.lineTo(timeDiff * newX, timeDiff * newY);

        ctx.clearRect(-width / 2, -height / 2, width, height);
        ctx.stroke();
    }

}

async function drawBranches(canvas, ctx, branchArray, width, height, timeDiff) {

    await Promise.all(branchArray.map(async (branch) => {
        const {x, y, newX, newY} = branch;

        ctx.moveTo(x, y);
        ctx.lineTo(timeDiff * (newX - x) + x, timeDiff * (newY - y) + y);
    }))

    // for(let b in branchArray) {
    //     const { x, y, newX, newY } = branchArray[b];
    //
    //     ctx.moveTo(x, y);
    //     ctx.lineTo(timeDiff*(newX - x) + x, timeDiff*(newY - y) + y);
    //
    //     ctx.clearRect(-width/2, -height/2, width, height);
    //     ctx.stroke();
    // }

    // const bitmap = canvas.transferToImageBitmap();
    // postMessage({bitmap})
}

async function animateBranches(canvas, ctx, workers, angleArea, length, x, y, branches, branchArray, width, height, depth, time, branchMemoryArray, trippy) {

    let timeDiff = ((new Date()).getTime() - time.getTime()) / 1000;
    // timeDiff=1;

    if (trippy) {
        trippyDrawBranches(canvas, ctx, branchArray, width, height, timeDiff);
    } else {
        await drawBranches(canvas, ctx, branchArray, width, height, timeDiff);
    }

    // console.log(timeDiff);
    if (timeDiff >= 1) {
        // let newX = branchArray[0].newX;
        // let newY = branchArray[0].newY;
        // drawFractal(
        //     canvas,
        //     ctx,
        //     workers,
        //     branchArray,
        //     x,
        //     y,
        //     newX,
        //     newY,
        //     angleArea,
        //     depth + 1,
        //     0,
        //     width,
        //     height
        // );
    } else {
        requestAnimationFrame(() => {
            animateBranches(canvas, ctx, workers, angleArea, length, x, y, branches, branchArray, width, height, depth, time, branchMemoryArray)
        });
    }
}

async function animateBranch(canvas, ctx, x, y, newX, newY, width, height, time) {

    let timeDiff = ((new Date()).getTime() - time.getTime()) / 1000;

    ctx.moveTo(x, y);
    ctx.lineTo(timeDiff * (newX - x) + x, timeDiff * (newY - y) + y);

    ctx.clearRect(-width / 2, -height / 2, width, height);
    ctx.stroke();

    if (timeDiff < 1) {

        const bitmap = canvas.transferToImageBitmap();
        postMessage({bitmap})

        requestAnimationFrame(() => {
            animateBranch(canvas, ctx, x, y, newX, newY, width, height, time);
        })

        // animateBranch( canvas, ctx, x, y, newX, newY, width, height, time );
    }
}

// angleArea <= 90
/*
determine branch direction
determine branch
(pseudo) randomize number of branches?
pseudo randomize direction of branches?
 */
async function drawFractal(canvas, ctx, workers, branchMemoryArray, ox, oy, x, y, angleArea, depth, branch, width, height) {
    if (Math.abs(x) < width / 2 && Math.abs(y) < height / 2) {

        if (depth > 8) return;

        let branches = (branch === -1) ? Math.round(Math.random() * 5 + 3) : Math.round(Math.random() * 2 + 2);
        let length = Math.random() * 150 + 50;
        let branchArray = [];

        // await generateBranches(canvas, ctx, angleArea, 0, length, ox, oy, x, y, branches, branchArray, width, height);

        branchMemoryArray.splice(0, 0, {
            x: ox,
            y: oy,
            newX: x,
            newY: y,
        });

        // let startTime = (new Date).getTime();
        // for (let b in branchMemoryArray) {
        //     let branch = branchMemoryArray[b];
        //     let x = branch.x;
        //     let y = branch.y;
        //     let mx = branch.newX;
        //     let my = branch.newY;
        //
        //     let tilt = Math.atan2(my, mx) - Math.atan2(y, x);
        //
        //     // TODO make this threaded
        //     await generateBranches(canvas, ctx, angleArea, tilt, length, x, y, mx, my, branches, branchArray, width, height);
        // }
        // let endTime = (new Date).getTime();
        // console.log(`diff: ${(endTime - startTime)/1000}`)

        let startTime = (new Date).getTime();

        let chunkSize = branchMemoryArray.length < workers.length ? branchMemoryArray.length : branchMemoryArray.length/workers.length;

        let promises = [];

        for(let w in workers) {
            const worker = workers[w];
            const chunk = branchMemoryArray.slice(w*chunkSize, w*chunkSize + chunkSize);

            worker.postMessage({
                branchMemoryArray: chunk,
                width,
                height,
                branches, // max number
                length,
                angleArea,
            });

            promises.push(new Promise((resolve, reject) => {
                worker.addEventListener('message', e => {
                    if(!e) reject(e);
                    resolve(e.data);
                })
            }))
        }

        await Promise.all(promises)
            .then(arrays => {
                branchArray = branchArray.concat(...arrays);
            });

        let endTime = (new Date).getTime();
        console.log(`diff: ${(endTime - startTime)/1000}`)

        // await Promise.all(branchArray.map(async(branch) => {
        //     const { x, y, newX, newY } = branch;
        //
        //     await new Promise((resolve, reject) => {
        //         setTimeout(() => {
        //             animateBranch(canvas, ctx, x, y, newX, newY, width, height, new Date());
        //             resolve();
        //         }, 10);
        //     });
        // }));
        //
        // let newX = branchArray[0].newX;
        // let newY = branchArray[0].newY;
        // drawFractal(
        //     canvas,
        //     ctx,
        //     branchArray,
        //     x,
        //     y,
        //     newX,
        //     newY,
        //     angleArea,
        //     depth+1,
        //     0,
        //     width,
        //     height
        // );

        // for(let b in branchArray) {
        //
        //     const {x, y, newX, newY} = branchArray[b];
        //     requestAnimationFrame(() => {
        //         animateBranch(canvas, ctx, x, y, newX, newY, width, height, new Date());
        //     });
        // }

        requestAnimationFrame(() => {
            animateBranches(canvas, ctx, workers, angleArea, length, x, y, branches, branchArray, width, height, depth, new Date(), branchMemoryArray)
        });


        let newX = branchArray[0].newX;
        let newY = branchArray[0].newY;
        drawFractal(
            canvas,
            ctx,
            workers,
            branchArray,
            x,
            y,
            newX,
            newY,
            angleArea,
            depth + 1,
            0,
            width,
            height
        );


    } else {

    }
}

async function animateFractal(canvas, workers) {
    const ctx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;

    ctx.translate(width / 2, height / 2);

    ctx.beginPath();

    // randomize??
    ctx.strokeStyle = 'rgba(0, 153, 255, 1)';

    await drawFractal(canvas, ctx, workers, [], 0, 0, 0, 0, Math.PI / 2, 0, -1, width, height);

    // ctx.closePath();
}

async function canvasService( canvas ) {

    // console.log(canvas);

    const { width, height } = canvas;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(-width / 2, -height / 2, width, height);
    ctx.stroke();

    const bitmap = canvas.transferToImageBitmap();
    postMessage({bitmap});

    setTimeout(() => {
        canvasService(canvas);
    }, 20)
}

self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
    if (!e) return;

    const {
        width,
        height,
        maxBranches
    } = e.data;

    let workers = [];
    let maxThreads = navigator.hardwareConcurrency;
    for(let w = 0; w < maxThreads; w++) {
        workers.push(new BranchWorker());
    }

    const canvas = new OffscreenCanvas(width, height);
    animateFractal(canvas, workers);
    canvasService(canvas);

//
//     const canvas = e.data.canvas;
//     animateFractal(canvas);
//     canvasService(canvas);
});
