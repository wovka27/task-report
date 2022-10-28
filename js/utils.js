export const getDayWeek = () =>
    ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][new Date().getDay()];

export const getValues = (items, valCb) => items.map((item) => valCb(item)).join('');

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

export const storage = {
    get: (name) => JSON.parse(localStorage.getItem(name)),
    set: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
    delete: (name) => localStorage.removeItem(name)
}

export const number = {
    get random() {
        const arr = [];
        while(arr.length < 3){
            const r = Math.floor(Math.random() * 100) + 1;
            if(arr.indexOf(r) === -1) arr.push(r);
        }
        return arr[1];
    }
}

export const getTaskListItemBody = (item) => `
            <li class="result-task-list__item">
                <i data-content="${item.id}">${item.value.trim()}</i>
                <span class="result-task-list__item-close" id="${item.id}">X</span>
            </li>`

export const addHandlers = (e, task, tasks, cb) => {
    const handler = (event) => {
        task.value = event.target.innerText;
    }
    const blur = () => {
        const items = [...new Set([...tasks, task])]
        storage.set('tasks-report', items)
        cb(items)
        e.target.removeEventListener('input', handler)
        e.target.removeEventListener('keydown', keyDown)
        e.target.removeEventListener('blur', blur)
        e.target.contentEditable = false;
    }

    const keyDown = (e) => {
        if (e.code === 'Enter') {
            blur()
        }
    }
    e.target.addEventListener('blur', blur)
    e.target.addEventListener('keydown', keyDown)
    e.target.addEventListener('input', handler)
}