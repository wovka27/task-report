export const createVNode = (tagName, props = {}, children = []) => {
  if (typeof tagName === "function") {
    return tagName(props, children);
  }

  return {
    tagName,
    props,
    children,
  };
};

export const createDOMNode = (vNode) => {
  // if (typeof vNode === "undefined") {
  // 	return document.createTextNode(typeof vNode);
  // }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode);
  }

  if (typeof vNode === "undefined") {
    return document.createTextNode("ggg");
  }

  const { tagName, props, children } = vNode;

  // создаем DOM-узел
  const node = document.createElement(tagName);

  // Добавляем атрибуты к DOM-узлу
  patchProps(node, {}, props);

  //if(children) {
  // Рекурсивно обрабатываем дочерные узлы
  children.forEach((child) => {
    node.appendChild(createDOMNode(child));
  });
  //}

  return node;
};

export const patchNode = (node, vNode, nextVNode) => {
  // Удаляем ноду, если значение nextVNode не задано
  if (nextVNode === undefined) {
    node.remove();
    return;
  }

  if (typeof vNode === "string" || typeof nextVNode === "string") {
    // Заменяем ноду на новую, если как минимум одно из значений равно строке
    // и эти значения не равны друг другу
    if (vNode !== nextVNode) {
      const nextNode = createDOMNode(nextVNode);
      node.replaceWith(nextNode);
      return nextNode;
    }

    // Если два значения - это строки и они равны,
    // просто возвращаем текущую ноду
    return node;
  }

  // Заменяем ноду на новую, если теги не равны
  if (vNode.tagName !== nextVNode.tagName) {
    const nextNode = createDOMNode(nextVNode);
    node.replaceWith(nextNode);
    return nextNode;
  }

  // Патчим свойства (реализация будет далее)
  patchProps(node, vNode.props, nextVNode.props);

  // Патчим детей (реализация будет далее)
  patchChildren(node, vNode.children, nextVNode.children);

  // Возвращаем обновленный DOM-элемент
  return node;
};

const patchProp = (node, key, value, nextValue) => {
  // Если новое значение не задано, то удаляем атрибут
  if (nextValue == null || nextValue === false) {
    node.removeAttribute(key);
    return;
  }

  if (key.startsWith("on") && key.toLowerCase() in window) {
    const eventName = key.slice(2);

    node[eventName] = nextValue;

    if (!nextValue) {
      node.removeEventListener(eventName, listener);
    } else if (!value) {
      node.addEventListener(eventName, listener);
    }
    return;
  }

  // Стоит отметить, что setAttribute преобразует значение в строчку, поэтому если нужно хранить объекты, массивы или методы, то их необходимо сеттить в node, например:
  // const key = 'customArray';
  // const value = [1, 5];
  //
  // node[key] = value;

  // Устанавливаем новое значение атрибута
  node.setAttribute(key, nextValue);
};

const patchProps = (node, props, nextProps) => {
  // Объект с общими свойствами
  const mergedProps = { ...props, ...nextProps };

  Object.keys(mergedProps).forEach((key) => {
    // Если значение не изменилось, то ничего не обновляем
    if (props[key] !== nextProps[key]) {
      patchProp(node, key, props[key], nextProps[key]);
    }
  });
};

const patchChildren = (parent, vChildren, nextVChildren) => {
  parent.childNodes.forEach((childNode, i) => {
    patchNode(childNode, vChildren[i], nextVChildren[i]);
  });

  //if (vChildren && nextVChildren) {
  nextVChildren
    .slice(vChildren.length)
    .forEach((vChild) => parent.appendChild(createDOMNode(vChild)));
  //}
};

export const patch = (nextVNode, node) => {
  if (!node) {
    if (nextVNode.props.hasOwnProperty("class")) {
      console.warn(
        `node for ${nextVNode.tagName}.${
          nextVNode.props.class
        } is ${typeof node}!`
      );
    } else {
      console.warn(`node for ${JSON.stringify(nextVNode)} is ${typeof node}`);
    }
  }

  const vNode = node.v || recycleNode(node);

  // Патчим DOM-ноду
  node = patchNode(node, vNode, nextVNode);

  // Сохраняем виртуальное дерево в DOM-ноду
  node.v = nextVNode;

  return node;
};

const TEXT_NODE_TYPE = 3;

const recycleNode = (node) => {
  // Если текстовая нода - то возвращаем текст
  if (node.nodeType === TEXT_NODE_TYPE) {
    return node.nodeValue;
  }

  //  Получаем имя тега
  const tagName = node.nodeName.toLowerCase();

  // Рекурсивно обрабатываем дочерние ноды
  const children = [].map.call(node.childNodes, recycleNode);

  // Создаем виртуальную ноду
  return createVNode(tagName, {}, children);
};

function listener(event) {
  return this[event.type](event);
}
