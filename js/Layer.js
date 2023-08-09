export class Layer {
    constructor(container) {
        container.appendChild(this.createLayer())
        addEventListener('resize', () => this.fitToContainer(), false);
        this.fitToContainer();
    }

    createLayer() {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        return this.canvas;
    }

    fitToContainer() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    get w() { return this.canvas.width }
    get h() { return this.canvas.height }
}