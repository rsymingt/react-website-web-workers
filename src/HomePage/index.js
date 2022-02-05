
import React, {
    useState,
    useEffect,
    useContext,
    useReducer,
    useRef
} from 'react';

import UserContext from "../UserContext";

import FractalWorker from './fractal.worker';
import GifWorker from './gif.worker';

import {
    MDBAnimation,
    MDBBtn
} from 'mdbreact';
import BranchWorker from "./branch.worker";

const gifEncoder = require('gif-encoder');

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
                        <MDBBtn>Learn More</MDBBtn>
                    </MDBAnimation>
                </Section>
                <Section style={{
                    // backgroundColor: 'black'
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
        position: "relative",
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

class GifWorkerManager {
    constructor() {
        this.currentWorker = 0;
        // this.maxWorkers = navigator.hardwareConcurrency;
        this.maxWorkers = 1;

        this.workers = [];
        for(let w = 0; w < this.maxWorkers; w++) {
            let worker = new GifWorker();
            let data = [];
            let res, rej;
            let complete = new Promise((resolve, reject) => {
                res = resolve;
                rej = reject;
            });

            worker.onmessage = (e) => {
                if(e.data.message && e.data.message === 'done') {
                    res();
                } else {
                    console.log('receive');
                    data.push(e.data);
                }
            };

            this.workers.push({
                worker,
                data,
                complete,
            });
        }
    }

    async getGifBlob() {
        let buffer;

        let workersDataArray = [];
        let first = true;
        for(let i in this.workers) {
            let worker = this.workers[i];
            await worker.complete;
            let workerDataArray = worker.data;

            if(first) workersDataArray = workersDataArray.concat(workerDataArray.slice(0));
            else workersDataArray = workersDataArray.concat(workerDataArray.slice(1));

            first = false;
        }

        for(let i in workersDataArray) {
            let uInt8ArrayData = workersDataArray[i];
            if(!buffer) buffer = uInt8ArrayData;
            else {
                let newEntireBuffer = new Uint8Array(buffer.length + uInt8ArrayData.length);
                newEntireBuffer.set(buffer);
                newEntireBuffer.set(uInt8ArrayData, buffer.length);
                buffer = newEntireBuffer;
            }
        }
        return new Blob([buffer]);
    }

    done() {
        this.workers.forEach(workerObj => {
            workerObj.worker.postMessage({message: "done"});
        })
    }

    postMessage( message ) {
        if(this.currentWorker >= this.maxWorkers) this.currentWorker = 0;
        this.workers[this.currentWorker++].worker.postMessage(message);
    }

    terminate() {
        this.workers.forEach(worker => {
            worker.worker.terminate();
        });
    }
}

let bitmapURL = null;
let ctx;
let gif;
let time = Date.now();
function FractalBackground( props ) {

    const canvasRef = useRef(null);
    const [bitmap, setBitmap] = useState(null);

    // TODO randomize angleArea in quadrants
    // TODO add logic to send branches away from clusterfuck of branching
    //  (length heightened, direction minimized to try to escape center

    const fractalWorker = new FractalWorker();
    const gifWorkerManager = new GifWorkerManager();

    const config = {
        // strokeStyle: 'rgba(0, 153, 255, 1)',
        strokeStyle: 'rgba(255, 255, 255, 1)',
        backgroundColor: "rgba(0, 0, 0, 1)",
        foregroundColor: "rgba(0 ,0 ,0 , 0.5)",

        width: window.innerWidth,
        height: window.innerHeight,
        angleArea: Math.PI,

        minLength: 50,
        maxLength: 150,
        minBranches: 2,
        maxBranches: 3,
        maxDepth: 14,

        limitX: window.innerWidth/2*1.5,
        limitY: window.innerWidth/2*1.5,

        // longestAnimationTime: 0.05,
        animateAllBranches: false,
        allowBranchesToGoBackward: false,

        gifDelay: 50,
        gifQuality: 20000,
        gifRepeat: 0, // -1 no repeat
    };

    fractalWorker.postMessage(config);
    fractalWorker.onmessage = (e) => {
        if(e.data.message && e.data.message === 'done') {
            gifWorkerManager.done();
            fractalWorker.terminate();
            return;
        }

        if(canvasRef !== null) {
            const canvas = canvasRef.current;
            // const ctx = canvas.getContext('bitmaprenderer');

            if(!ctx) ctx = canvas.getContext('2d');
            const bitmap = e.data.bitmap;

            ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            if(Date.now() - time > config.gifDelay) {
                console.log('yep');
                gifWorkerManager.postMessage({image: ctx.getImageData(0, 0, canvas.width, canvas.height).data, config: config})
                time = Date.now();
            } else {
            }

            canvas.toBlob(function(blob){
                bitmapURL = (URL.createObjectURL(blob));

                // let a = document.createElement('a');
                // a.href = URL.createObjectURL(new Blob(encoder.createReadStream().))

                const canvasDownload = document.getElementById('canvas-download');
                canvasDownload.href = canvas.toDataURL('image/jpg');
                canvasDownload.download = 'rsymingt.jpg';
            });

            // if(!rec) {
            //     stream = canvas.captureStream(20);
            //     rec = new MediaRecorder(stream, {
            //         mimeType: "video/webm; codecs=vp8"
            //     });
            //
            //     // let video = document.getElementById('canvas-video');
            //     // video.srcObject = stream;
            //
            //     rec.ondataavailable = e => {
            //         // console.log(e.data);
            //         chunks.push(e.data);
            //     };
            //
            //     rec.onstop = e => console.log('stop');
            //
            //     rec.start(100);
            // }
            // if(rec) {
            //     let videoBlob = new Blob(chunks, {type: 'video/mp4'});
            //
            //     // let videoObject = document.createElement('video');
            //     // videoObject.srcObject = videoBlob;
            //     // document.write(videoObject);
            //
            //     let videoURL = URL.createObjectURL(videoBlob);
            //
            //     const canvasDownload = document.getElementById('canvas-video-download');
            //     canvasDownload.href = videoURL;
            //     canvasDownload.download = 'rsymingt.mp4';
            // }

            // let bitmapBlob = new Blob([bitmap]);
            // let objectURL = URL.createObjectURL(bitmapBlob);
            // setBitmap(objectURL)
        }
    };

    useEffect(() => {
        return () => {
            fractalWorker.terminate();
        }
    });

    return(
        <div  style={{
            // backgroundColor: "rgba(0 ,0 ,0 , 1)",
            position: "fixed",
            // zIndex: '-2',
            top: 0,
            bottom:0,
            left: 0,
            right: 0,
            overflow: "auto"
        }} >
            <canvas style={{
                filter: "blur(2px)",
                position: "fixed",
                // zIndex: '-1',
                top: 0,
                bottom:0,
                left: 0,
                right: 0,
            }} onScroll={() => console.log("scrolling")} ref={canvasRef} width={window.innerWidth} height={window.innerHeight}/>
            <div style={{
                // backgroundColor: "rgba(0 ,0 ,0 , 0.5)",
                position: "fixed",
                zIndex: '0',
                top: 0,
                bottom:0,
                left: 0,
                right: 0,
            }} />
            <a id={"canvas-download"} style={{
                backgroundColor: "rgba(0 ,0 ,0 , 0.5)",
                position: "fixed",
                zIndex: '1',
                color: "white"
            }} href={bitmap} onClick={(el) => {
            }}>download</a>
            <a id={"canvas-video-download"} style={{
                backgroundColor: "rgba(0 ,0 ,0 , 0.5)",
                position: "fixed",
                top: 30,
                zIndex: '1',
                color: "white"
            }} href={bitmap} onClick={async(el) => {
                console.log('waiting');
                let blob = await gifWorkerManager.getGifBlob();
                let a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'test.gif';
                a.click();
                //     .then(blob => console.log(blob));
            }}>Download Gif</a>
            {props.children}
        </div>
    )
}

export default HomePage;