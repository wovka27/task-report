import Store from "./Store.js";

export default class Component {
    constructor(props = {}) {
        console.log()
        if (props.store instanceof Store && 'render' in this) {
            props.store.events.subscribe("changeState", () => this.render())
        }
    }

}
