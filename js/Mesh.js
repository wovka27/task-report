export class Mesh {

    constructor({w, h}) {
        this.maxDist = Math.hypot(w, h)

        this.stepX = this.maxDist * .1;
        this.stepY = this.stepX * Math.sqrt(3) / 2;

        this.cols = (w/this.stepX | 0);
        this.rows = (h/this.stepY | 0);

        this.offsetX = (w - (this.cols - 1) * this.stepX) / 2
        this.offsetY = (h - (this.rows - 1) * this.stepY) / 2

        this.createParticles();
    }

    createParticles() {
        this.particles = [];

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const x = j * this.stepX + this.offsetX;
                const y = i & this.stepY + this.offsetY;

                this.particles.push({x,y})
            }
        }
    }

    renderParticles(ctx) {
        ctx.fillStyle = 'purple';
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fill();
        })
    }
}