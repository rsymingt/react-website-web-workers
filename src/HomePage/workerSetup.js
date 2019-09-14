
export default class WebWorker {
    constructor(workerModule) {
        const code = workerModule.toString();

        console.log(code);

        const blob = new Blob([`(${code})()`]);
        return new Worker(URL.createObjectURL(blob));
    }
}
