
import React, {
    useState,
    useEffect,
    useContext,
    useReducer,
    useRef
} from 'react';

import UserContext from "../UserContext";

import fractalWorker from './fractal.worker';

import {
    MDBAnimation,
    MDBBtn
} from 'mdbreact';

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
                <Section>
                    <MDBAnimation type="zoomIn" duration={'500ms'}>
                        <h1 style={{
                            color: "white"
                        }}>Hello, my name is Ryan Symington</h1>
                        t
                    </MDBAnimation>
                </Section>
                <Section style={{
                    backgroundColor: 'black'
                }}>
                    <MDBAnimation type="zoomIn">
                        <h1 style={{
                            color: "white"
                        }}>Hello, my name is Ryan Symington</h1>
                    </MDBAnimation>
                </Section>
            </FractalBackground>
        </div>
    )
}

function Section( props ) {

    const style = props.style ? props.style : {};

    Object.assign(style, {
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    });

    return(
        <div {...props} style={style}>
            {props.children}
        </div>
    )
}
let bitmapURL = null
function FractalBackground( props ) {

    const canvasRef = useRef(null);
    const [bitmap, setBitmap] = useState(null);

    console.log(bitmap)

    // TODO randomize angleArea in quadrants
    // TODO add logic to send branches away from clusterfuck of branching
    //  (length heightened, direction minimized to try to escape center

    const worker = new fractalWorker();
    worker.postMessage({
        // strokeStyle: 'rgba(0, 153, 255, 1)',
        strokeStyle: 'rgba(255, 255, 255, 1)',

        width: window.innerWidth,
        height: window.innerHeight,
        angleArea: Math.PI,

        minLength: 50,
        maxLength: 150,
        minBranches: 2,
        maxBranches: 4,
        maxDepth: 14,

        limitX: window.innerWidth/2*1.5,
        limitY: window.innerWidth/2*1.5,

        // longestAnimationTime: 0.05,
        animateAllBranches: false,
        allowBranchesToGoBackward: false,
    });

    worker.onmessage = (e) => {
        if(canvasRef !== null) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('bitmaprenderer');
            const bitmap = e.data.bitmap;

            ctx.transferFromImageBitmap(bitmap);
            canvas.toBlob(function(blob){

                // console.log(blob);
                // console.log(encodeURIComponent(blob));
                bitmapURL = (URL.createObjectURL(blob));

                const reader = new FileReader();

                reader.addEventListener('loadend', (e) => {

                    const text = e.target.result;
                    // console.log(text);


                    var element = document.createElement('a');
                    // element.setAttribute('href', 'data:image/png;base64,' + encodeURIComponent(text));
                    // element.setAttribute('download', filename);
                    element.setAttribute('href', text);
                    element.setAttribute('href', URL.createObjectURL(blob));
                   // element.setAttribute('target', '_blank')

                    element.style.display = 'none';
                    document.body.appendChild(element);

                    // element.click();

                    document.body.removeChild(element);

                    // worker.onmessage = () => {}

                });

                reader.readAsDataURL(blob);

                // var element = document.createElement('a');
                // element.setAttribute('href', 'data:image/png;charset=utf-8,' + encodeURIComponent(bitmap));
                // // element.setAttribute('download', filename);
                // element.setAttribute('href', bitmapURL)
                //
                // element.style.display = 'none';
                // document.body.appendChild(element);
                //
                // // element.click();
                //
                // document.body.removeChild(element);
            })

            // let bitmapBlob = new Blob([bitmap]);
            // let objectURL = URL.createObjectURL(bitmapBlob);
            // setBitmap(objectURL)
        }
    };

    useEffect(() => {

        return () => {
            worker.terminate();
        }
    });

    return(
        <div  style={{
            backgroundColor: "rgba(0 ,0 ,0 , 1)",
            position: "fixed",
            zIndex: '-2',
            top: 0,
            bottom:0,
            left: 0,
            right: 0,
            overflow: "auto"
        }}>
            <canvas style={{
                filter: "blur(2px)",
                position: "fixed",
                zIndex: '-1',
                top: 0,
                bottom:0,
                left: 0,
                right: 0,
            }} ref={canvasRef} width={window.innerWidth} height={window.innerHeight}/>
            <div style={{
                backgroundColor: "rgba(0 ,0 ,0 , 0.5)",
                position: "fixed",
                zIndex: '0',
                top: 0,
                bottom:0,
                left: 0,
                right: 0,
            }} />
            <a style={{
                backgroundColor: "rgba(0 ,0 ,0 , 0.5)",
                position: "fixed",
                zIndex: '1',
                color: "white"
            }} href={bitmap} onClick={(el) => {
            }}>download</a>
            {props.children}
        </div>
    )
}

export default HomePage;