const getDayWeek = () => ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][new Date().getDay()];

export const DAY_WEEK = getDayWeek();

export const TASK_REPORT = 'tasks-report';

export const getValues = (items, valCb) => items?.map((item) => valCb(item)).join('');

export const writeClipboard = async (val = '') => {
    if (!Boolean(val)) {
        return;
    }

    try {
        await navigator.clipboard.writeText(val)
        alert('Текст скопирован!');
    } catch (e) {
        alert('Не удалось скопировать!');
    }
}

export const getChangeTask = (type, cb) => {
    const tasks = storage.get(TASK_REPORT);
    const result = tasks[type](item => cb(item))

    return {tasks, result}
}

export const setStorageTask = (value, render) => {
    storage.set(TASK_REPORT, [...new Set([...storage.get(TASK_REPORT) ?? [], value])]);
    render(storage.get(TASK_REPORT))
}

export const storage = {
    get: (name) => JSON.parse(localStorage.getItem(name)),
    set: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
    delete: (name) => localStorage.removeItem(name)
}

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
