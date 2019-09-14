
import React, {
    useState,
    useEffect,
    useContext,
    useReducer,
    useRef
} from 'react';

import UserContext from "../UserContext";

import fractalWorker from './fractal.worker';
// import WebWorker from "./workerSetup";

import {
    MDBAnimation,
    MDBBtn,
} from 'mdbreact';

function useCustomHook() {

}

function HomePage() {

    const [count, setCount] = useState(0);
    const user = useContext(UserContext);

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        // Update the document title using the browser API
        // document.title = `You clicked ${count} times`;

        return () => {
            // CLEAN UP after unmount
        }
    });

    return(
        <div>
            <FractalBackground>
                <div style={{
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    zIndex: '1000',
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <MDBAnimation type="bounce" infinite>
                        <h1>Hello, my name is Ryan Symington</h1>
                    </MDBAnimation>
                </div>
            </FractalBackground>
        </div>
    )
}

function FractalBackground(props) {

    const canvasRef = useRef(null);

    // TODO pseudo randomize angleArea
    // TODO

    const worker = new fractalWorker();
    worker.postMessage({
        width: window.innerWidth,
        height: window.innerHeight,
        angleArea: Math.PI/1.5,

        minLength: 100,
        maxLength: 200,
        minBranches: 2,
        maxBranches: 4,
        maxDepth: 12,

        limitX: window.innerWidth/2*2,
        limitY: window.innerWidth/2*2,

        // longestAnimationTime: 0.05,
        animateAllBranches: false,
        allowBranchesToGoBackward: false,
    });

    worker.addEventListener('message', (e) => {
        if(canvasRef !== null) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('bitmaprenderer');

            ctx.transferFromImageBitmap(e.data.bitmap)
        }
    });

    return(
        <div  style={{
            backgroundColor: "rgba(0 ,0 ,0 , 0.35)",
            position: "fixed",
            zIndex: '1',
            top: 0,
            bottom:0,
            left: 0,
            right: 0,
            overflow: "auto"
        }}>
            <canvas style={{
                filter: "blur(4px)",
                position: "fixed",
                zIndex: '-2',
                top: 0,
                bottom:0,
                left: 0,
                right: 0,
            }} ref={canvasRef} width={window.innerWidth} height={window.innerHeight}/>
            {props.children}
        </div>
    )
}

export default HomePage;