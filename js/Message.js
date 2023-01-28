import {afterAnimationEnd} from "./utils.js";
import {createDOMNode, createVNode} from "./virtual-dom.js";

class Message {
    constructor() {
        this.timer = null;
        this.isTimer = false;
        this.element = createDOMNode(
            createVNode("div", {class: "message animated-show"}, [
                createVNode("div", {class: "message-inner-wrapper"}, [
                    createVNode("i", {class: "message__content"}),
                    createVNode(
                        "span",
                        {class: "message__close", onclick: this.closeMessage},
                        ["X"]
                    ),
                ]),
            ])
        );
    }

    closeMessage = () => {
        if (this.isTimer) {
            this.element.style.display = 'none';
        } else {
            document.body.removeChild(this.element);
        }
    };

    showMessage = (text) => {
        this.element.style.display = "flex";
        document.body.appendChild(this.element);
        this.element.children[0].children[0].textContent = text;
        this.autoCloseMessage()
    };

    autoCloseMessage = () => {
        this.isTimer = true;
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
            document.body.removeChild(this.element)
            this.isTimer = false;
        }, 3000);
    }
}

export default Message;
