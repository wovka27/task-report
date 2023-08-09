import {Layer} from "../js/Layer.js";
import {Loop} from "../js/Loop.js";
import {Mesh} from "../js/Mesh.js";

export class Canvas {
    constructor(container) {
        this.layer = new Layer(container);

        this.createMesh();

        this.loop = new Loop(time => this.update(time), () => this.display())
    }

    createMesh() {
        this.mesh = new Mesh(this.layer)
    }

    update(correction = 0) {

    }

    display() {
        this.mesh.renderParticles(this.layer.context)
    }
}