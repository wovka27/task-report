import Component from "./Component.js";

class Message extends Component {
  constructor() {
    super();
    this.timer = null;
    this.element = document.createElement("div");
    this.createMessage();
    this.closeBtn = this.element.children[0].children[1];
    this.closeBtn.addEventListener("click", this.deleteMessage);
  }

  createMessage = () => {
    const innerWrapper = document.createElement("div");
    const i = document.createElement("i");
    const span = document.createElement("span");
    this.element.className = "message animated-show";
    innerWrapper.className = "message-inner-wrapper";
    i.className = "message__content";
    span.className = "message__close";
    span.textContent = "X";
    [i, span].forEach((item) => innerWrapper.appendChild(item));
    this.element.append(innerWrapper);
  };

  deleteMessage = () => {
    this.element.style.display = "none";
  };

  showMessage = (text) => {
    this.element.style.display = "flex";
    this.autoDeleteMessage();
    document.body.appendChild(this.element);
    this.element.children[0].children[0].textContent = text;
  };

  autoDeleteMessage = (ms = 3000) => {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.deleteMessage(), ms);
  };
}

export default Message;
