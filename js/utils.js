export const date = {
    dayWeek: [
            "Воскресенье",
            "Понедельник",
            "Вторник",
            "Среда",
            "Четверг",
            "Пятница",
            "Суббота",
        ][new Date().getDay()],
    today: new Date().toISOString().slice(0, 10).split("-").reverse().join("."),
};

export const DAY_WEEK = date.dayWeek;

export const checkBrowser = (type) => navigator.userAgent.toLowerCase().match(type)

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
 * Горизонтальная прокрутка по клику и колесику
 *
 * @param {string} selector
 */
export const grabScroll = (selector) => {
    const $el = document.querySelector(selector)

    /**
     * Отключение всех событий у потомков при скролле по клику
     * @param flag
     */
    const noClick = (flag) => {
        Array.from($el.children).forEach((item) => {
            if (flag) {
                item.style.pointerEvents = "none";
            } else {
                item.style.pointerEvents = "auto";
            }
        });
    };

    /**
     *
     * @param e {MouseEvent}
     */
    const down = (e) => {
        e.preventDefault();
        $el.style.cursor = 'grab'
        $el.savedPageX = e.pageX;
        $el.savedScrollLeft = $el.scrollLeft;
    };

    const up = () => {
        $el.style.cursor = 'default'
        $el.savedPageX = null
        noClick(false);
    }
    /**
     *
     * @param e {MouseEvent}
     */
    const move = (e) => {
        e.preventDefault();
        if (!$el.savedPageX) return;
        noClick($el.savedPageX);
        $el.scrollLeft =  $el.savedScrollLeft + $el.savedPageX - e.pageX;
        $el.style.cursor = 'grabbing'
    }

    const leave = e => {
        if ($el.savedPageX) {
            $el.savedPageX = null;
            return
        }
    }

    /**
     *
     * @param e {WheelEvent & {wheelDelta: number}}
     */
    const mousewheel = e => {
        e.preventDefault();
        if ($el.savedPageX) return;
        const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        $el.scrollLeft -= delta * 100;
        $el.savedScrollLeft = $el.scrollLeft
    }

    /**
     *
     * @type {Parameters<(type: keyof DocumentEventMap, listener: (this:Element, ev: any) => any, options?: boolean | AddEventListenerOptions) => void>[]}
     */
    const events = [
        ['mouseleave', leave],
        ["mousemove", move],
        ['mousedown',  down],
        ['mouseup', up],
        [checkBrowser('firefox') ? 'DOMMouseScroll' : 'mousewheel', mousewheel]
    ]

    for (const eventArgs of events) {
        $el.addEventListener(...eventArgs);
    }
}

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
