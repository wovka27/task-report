const getDayWeek = () => ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][new Date().getDay()];

export const DAY_WEEK = getDayWeek();

export const TASK_REPORT = 'tasks-report';

export const getValues = (items, valCb) => items?.map((item) => valCb(item)).join('');

export const writeClipboard = async (val = '') => {
    if (!Boolean(val)) {
        return;
    }
    await navigator.clipboard.writeText(val);
}

/**
 * @param type {'filter'|'find'}
 * @param cb {(item: {id: number, value: string}) => {id: number, value: string} | boolean}
 * @returns {{result: Array<{id: number | string, value: string}>, tasks: Array<{id: number | string, value: string}>}}
 */
export const getChangeTask = (type, cb) => {
    const tasks = storage.get(TASK_REPORT);
    const result = tasks[type](item => cb(item))

    return {tasks, result}
}

/**
 * @param value {{id: number | string, value: string}}
 * @param render {(tasks: Array<{id: number | string, value: string}>) => void}
 */
export const setStorageTask = (value, render) => {
    storage.set(TASK_REPORT, [...new Set([...storage.get(TASK_REPORT) ?? [], value])]);
    render(storage.get(TASK_REPORT))
}

export const storage = {
    get: (name) => JSON.parse(localStorage.getItem(name)),
    set: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
    delete: (name) => localStorage.removeItem(name)
}

/**
 *
 * @param target {HTMLElement | Event}
 * @param handlers {Array<(e: Event)=> void>}
 * @param remove {boolean}
 */
export const setEventListeners = (target, handlers = [], remove = false) => {
    const eventNames = ['input', 'keydown', 'blur'];
    if (!remove) {
        eventNames.forEach((name, index) => target.addEventListener(name, handlers[index]));
    } else {
        eventNames.forEach((name, index) => target.removeEventListener(name, handlers[index]));
    }
}

// export const throttle = (callback, timeout = 1000) => {
//     let timer = null
//
//     return ((...args) => {
//         if (timer) return
//
//         timer = setTimeout(() => {
//             callback(...args)
//             clearTimeout(timer)
//             timer = null
//         }, timeout)
//     })()
// }
