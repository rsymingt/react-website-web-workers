
import React, {
    useState,
    useEffect,
    useContext,
    useReducer,
    useRef
} from 'react';

import { Parallax, Background } from 'react-parallax';

import UserContext from "../UserContext";

function useCustomHook() {

}

function centerDistance(x, y) {
    return Math.round(Math.sqrt(Math.pow(0-x, 2) + Math.pow(0-y, 2)));
}

function generateBranches( ctx, angleArea, tilt, length, x, y, branches, branchArray, width, height) {

    for(let b = 0; b < branches; b ++) {

        let angle = (2*Math.PI)/branches*b + angleArea/2 + tilt;
        let newX = Math.round(Math.cos(angle)*length) + x;
        let newY = Math.round(Math.sin(angle)*length) + y;

        let newAngle = Math.round(Math.atan2(newY, newX)*180/Math.PI);
        let angleAreaDegrees = angleArea*180/Math.PI;

        // nothing can be behind the point
        if(centerDistance(newX, newY) - centerDistance(x,y) < 0) continue;

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

function drawBranches( ctx, branchArray, width, height, timeDiff ) {

    for(let b in branchArray) {
        const { x, y, newX, newY } = branchArray[b];

        ctx.moveTo(x, y);
        ctx.lineTo(timeDiff*newX, timeDiff*newY);

        // ctx.clearRect(-width/2, -height/2, width, height);
        ctx.stroke();
    }

}

function animateBranches( ctx, angleArea, length, x, y, branches, branchArray, width, height, depth, time, branchMemoryArray, trippy ) {

    let timeDiff = ((new Date()).getTime() - time.getTime())/1000;

    drawBranches(ctx, branchArray, width, height, timeDiff);

    console.log(timeDiff);
    if(timeDiff >= 1) {
        let newX = branchArray[0].newX;
        let newY = branchArray[0].newY;

        drawFractal2(
            ctx,
            branchArray,
            newX,
            newY,
            angleArea,
            depth+1,
            0,
            width,
            height
        );
    } else {
        window.requestAnimationFrame(() => {
            animateBranches( ctx, angleArea, length, x, y, branches, branchArray, width, height, depth, time, branchMemoryArray)
        });
    }
}

// angleArea <= 90
/*
determine branch direction
determine branch
(pseudo) randomize number of branches?
pseudo randomize direction of branches?
 */
async function drawFractal2( ctx, branchMemoryArray, x, y, angleArea, depth, branch, width, height ) {
    if(Math.abs(x) < width/2 && Math.abs(y) < height/2) {

        if(depth > 6) return;

        let branches = (branch === -1) ? Math.round(Math.random()*5 + 3):Math.round(Math.random()*4 + 1);
        let length = Math.random()*90 + 10;
        let branchArray = [];

        generateBranches(ctx, angleArea, 0, length, x, y, branches, branchArray, width, height);

        for(let b in branchMemoryArray) {
            let branch = branchMemoryArray[b];
            let mx = branch.newX;
            let my = branch.newY;

            let tilt = Math.atan2(my, mx) - Math.atan2(y, x);

            generateBranches(ctx, angleArea, tilt, length, mx, my, branches, branchArray, width, height);
        }

        window.requestAnimationFrame(() => {
            animateBranches( ctx, angleArea, length, x, y, branches, branchArray, width, height, depth, new Date(), branchMemoryArray)
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

    drawFractal2(ctx, [], 0, 0, Math.PI/2, 0, -1, width, height);

    ctx.closePath();
}

function HomePage() {

    const [count, setCount] = useState(0);
    const user = useContext(UserContext);

    const canvasRef = useRef(null);

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        // Update the document title using the browser API
        document.title = `You clicked ${count} times`;

        if(canvasRef !== null) {
            const canvas = canvasRef.current;
            console.log('start');
            animateFractal(canvas);
        }

        return () => {
            // CLEAN UP after unmount
        }
    });

    return(
        <div>
            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerWidth}/>
            {/*<Parallax*/}
            {/*    blur={10}*/}
            {/*    bgImage={require('path/to/image.jpg')}*/}
            {/*    bgImageAlt="the cat"*/}
            {/*    strength={200}*/}
            {/*>*/}
            {/*    Put some text content here - even an empty div with fixed dimensions to have a height*/}
            {/*    for the parallax.*/}
            {/*    <div style={{ height: '200px' }} />*/}
            {/*</Parallax>*/}
        </div>
    )
}

export default HomePage;