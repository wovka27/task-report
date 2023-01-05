import { afterAnimationEnd } from "./utils.js";
import { createDOMNode, createVNode } from "./virtual-dom.js";

class Message {
  constructor() {
    this.timer = null;
    this.element = createDOMNode(
      createVNode("div", { class: "message animated-show" }, [
        createVNode("div", { class: "message-inner-wrapper" }, [
          createVNode("i", { class: "message__content" }),
          createVNode(
            "span",
            { class: "message__close", onclick: this.closeMessage },
            ["X"]
          ),
        ]),
      ])
    );
  }

  closeMessage = () => {
    document.body.removeChild(this.element);
  };

  showMessage = (text) => {
    this.element.style.display = "flex";
    document.body.appendChild(this.element);
    this.element.children[0].children[0].textContent = text;
  };
}

export default Message;
