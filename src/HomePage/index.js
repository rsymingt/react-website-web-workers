
import React, {
    useState,
    useEffect,
    useContext,
    useReducer,
    useRef
} from 'react';

import { Parallax, Background } from 'react-parallax';

import UserContext from "../UserContext";

import fractalWorker from './fractal.worker';
// import WebWorker from "./workerSetup";

function useCustomHook() {

}

function HomePage() {

    const [count, setCount] = useState(0);
    const user = useContext(UserContext);

    const canvasRef = useRef(null);

    const worker = new fractalWorker();
    worker.postMessage({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    worker.addEventListener('message', (e) => {
        if(canvasRef !== null) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('bitmaprenderer');

            ctx.transferFromImageBitmap(e.data.bitmap)
        }
    });

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        // Update the document title using the browser API
        document.title = `You clicked ${count} times`;

        return () => {
            // CLEAN UP after unmount
        }
    });

    return(
        <div>
            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}/>
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