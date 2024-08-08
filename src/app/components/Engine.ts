export default class Engine {
    private worker: Worker | null = null;
    private onMessageCallback: ((bestMove: string) => void) | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.initWorker();
        }
    }

    private initWorker() {
        if (typeof window !== 'undefined' && !this.worker) {
            this.worker = new Worker(new URL('./chessWorker.js', import.meta.url));
            this.worker.onmessage = (e: MessageEvent) => {
                if (this.onMessageCallback) {
                    this.onMessageCallback(e.data);
                }
            };
        }
    }

    setCallback(callback: (bestMove: string) => void) {
        this.onMessageCallback = callback;
        if (!this.worker && typeof window !== 'undefined') {
            this.initWorker();
        }
    }

    sendFEN(message: string) {
        if (!this.worker && typeof window !== 'undefined') {
            this.initWorker();
        }
        this.worker?.postMessage(message);
    }

    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}