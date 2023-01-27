export const date = {
    dayWeek: (() =>
        [
            "Воскресенье",
            "Понедельник",
            "Вторник",
            "Среда",
            "Четверг",
            "Пятница",
            "Суббота",
        ][new Date().getDay()])(),
    today: (() =>
        new Date().toISOString().slice(0, 10).split("-").reverse().join("."))(),
};

export const DAY_WEEK = date.dayWeek;

export const TASK_REPORT = "tasks-report";
export const ARCHIVE_LISTS = "archive-lists";

export const getValues = (items, valCb) =>
    items?.map((item) => valCb(item)).join("");

export const writeClipboard = async (val) => {
    if (!Boolean(val)) {
        return;
    }
    await navigator.clipboard.writeText(val);
};

/**
 * @param type {'filter'|'find'}
 * @param cb {(item: {id: number, value: string}) => {id: number, value: string} | boolean}
 * @returns {{
 *      result: Array<{id: number | string, value: string}> | {id: number | string, value: string},
 *      tasks: Array<{id: number | string, value: string}>,
 *      setResult: (d?:Array<{id: number | string, value: string}>) => void
 *      }}
 */
export const getChangeTask = (type, cb) => {
    const {data: tasks} = useStorage();
    const result = tasks[type]((item) => cb(item));
    const setResult = (data = result) => storage.set(TASK_REPORT, data);
    return {tasks, result, setResult};
};

/**
 *
 * @param value {({id: (number|string), value: string}|Array<{id: (number|string), value: string}>)[]}
 * @returns {({id: (number|string), value: string}|Array<{id: (number|string), value: string}>)[]}
 */
export const noDuplicate = (value) => [...new Set(value)];

/**
 * @param value {{id: number | string, value: string}}
 * @param render {(tasks: Array<{id: number | string, value: string}>) => void}
 */
export const setStorageTask = (value, render) => {
    storage.set(
        TASK_REPORT,
        noDuplicate([...(storage.get(TASK_REPORT) ?? []), value])
    );
    render(storage.get(TASK_REPORT));
};

export const storage = {
    get: (name) => JSON.parse(localStorage.getItem(name)),
    set: (name, value) =>
        value && localStorage.setItem(name, JSON.stringify(value)),
    delete: (name) => localStorage.removeItem(name),
};

/**
 *
 * @param target {HTMLElement | Event}
 * @param handlers {Array<(e: MouseEvent)=> void>}
 * @param remove {boolean}
 */
export const setEventListeners = (target, handlers = [], remove = false) => {
    const eventNames = ["input", "keydown", "blur"];
    if (!remove) {
        eventNames.forEach((name, index) =>
            target.addEventListener(name, handlers[index])
        );
    } else {
        eventNames.forEach((name, index) =>
            target.removeEventListener(name, handlers[index])
        );
    }
};

/**
 *
 * @param name {string}
 */
export const useStorage = (name = TASK_REPORT) => {
    const data = storage.get(name) || [];
    const setData = (data) => storage.set(name, data);
    const deleteData = () => storage.delete(name);

    return {data, setData, deleteData};
};

/**
 *
 * @param cb {(animEnd: boolean) => void}
 */
export const afterAnimationEnd = (cb) => {
    let flag = false;
    const handler = (e) => {
        if (e.returnValue) {
            flag = !flag;
            cb(flag);
            document.removeEventListener("animationend", handler);
        }
    };
    document.addEventListener("animationend", handler);
};

/**
 * Горизонтальная прокрутка по клику
 *
 * @param {string} selector
 */
export const grabScroll = (selector) => {
    const $el = document.querySelector(selector)
    const scroll = {pos: 0, coorX: 0, speed: 1, isMove: false}

    const noClick = (flag) => {
        Array.from($el.children).forEach((item) => {
            if (flag) {
                item.style.pointerEvents = "none";
            } else {
                item.style.pointerEvents = "auto";
            }
        });
    };

    const down = (e) => {
        e.preventDefault();
        $el.style.cursor = 'grab'
        scroll.coorX = e.pageX - $el.offsetLeft;
        $el.addEventListener("mousemove", move);
    };

    const up = (e) => {
        e.preventDefault();
        $el.style.cursor = 'default'
        scroll.pos = $el.scrollLeft;
        $el.removeEventListener('mousemove', move);
        scroll.isMove = false;
        noClick(scroll.isMove);
    }

    const move = (e) => {
        e.preventDefault();
        if (e.movementX) {
            scroll.isMove = true;
        } else {
            scroll.isMove = false;
        }
        noClick(scroll.isMove)
        const data = - scroll.pos + (e.pageX - $el.offsetLeft - scroll.coorX) * scroll.speed
        if (data <= 0) {
            $el.scrollLeft = 0;
        }
        $el.scrollLeft = - data;
    }

    $el.addEventListener('mousedown',  down);
    document.addEventListener('mouseup', up);
}

export const scrollHorizontally = (selector) => {
    const $el = document.querySelector(selector);
    const handle = e => {
        e.preventDefault();
        const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        $el.scrollLeft -= (delta * 40);
    }
    $el.addEventListener('mousewheel', handle)
};

/**
 *
 * @param {string} text
 * @return {string}
 */
export const textDivider = (text) => {
    const textArr = text.split(" ");
    const startArgs = textArr.findIndex((item) => item.match(/:+$/));
    const textArgs =
        startArgs !== -1 &&
        textArr
            .slice(startArgs + 1, textArr.length)
            .map((item) => `   - ${item}`)
            .join("\n");
    return textArgs
        ? `${textArr.slice(0, startArgs + 1).join(" ")}\n${textArgs}`
        : text;
};
