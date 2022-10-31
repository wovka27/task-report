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
 * @returns {{
 *      result: Array<{id: number | string, value: string}>,
 *      tasks: Array<{id: number | string, value: string}>,
 *      setResult: (d?:Array<{id: number | string, value: string}>) => void
 *      }}
 */
export const getChangeTask = (type, cb) => {
    const {data: tasks} = useStorage()
    const result = tasks[type](item => cb(item))
    const setResult = (data = result) => storage.set(TASK_REPORT, data)
    return {tasks, result, setResult}
}

/**
 *
 * @param value {({id: (number|string), value: string}|Array<{id: (number|string), value: string}>)[]}
 * @returns {({id: (number|string), value: string}|Array<{id: (number|string), value: string}>)[]}
 */
export const noDuplicate = (value) => [...new Set(value)]

/**
 * @param value {{id: number | string, value: string}}
 * @param render {(tasks: Array<{id: number | string, value: string}>) => void}
 */
export const setStorageTask = (value, render) => {
    storage.set(TASK_REPORT, noDuplicate([...storage.get(TASK_REPORT) ?? [], value]));
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

/**
 *
 * @param name {string}
 */
export const useStorage =  (name= TASK_REPORT) => {
    const data = storage.get(name);
    const setData = (data) => storage.set(name, data)
    const deleteData = () => storage.delete(name);

    return {data, setData, deleteData}
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
            document.removeEventListener('animationend', handler)
        }
    }
    document.addEventListener('animationend', handler)
}
