
let GifEncoder = require('gif-encoder');
let gif;
let queue = [];

// async function addFrame( buffer ) {
//     if(!entireBuffer) entireBuffer = buffer;
//     else {
//         let newEntireBuffer = new Uint8Array(entireBuffer.length + buffer.length);
//         newEntireBuffer.set(entireBuffer);
//         newEntireBuffer.set(buffer, entireBuffer.length);
//         entireBuffer = newEntireBuffer;
//     }
//
//     let blob = new Blob([entireBuffer]);
//
//     postMessage(URL.createObjectURL(blob));
// }

onmessage = async(e) => {

    if(e.data.message && e.data.message === 'done') {
        await Promise.all(queue);
        postMessage({message: 'done'});
        return;
    }

    const config = e.data.config;
    const { gifQuality, gifDelay, gifRepeat } = config;
    if(!gif) {
        gif = new GifEncoder(config.width, config.height);

        gif.on('data', (data) => {
            postMessage(data);
        });

        gif.setQuality(gifQuality);
        gif.setDelay(gifDelay);
        gif.setRepeat(gifRepeat);

        gif.writeHeader();
    }
    queue.push(gif.addFrame(e.data.image));
};