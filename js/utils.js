const getDayWeek = () =>
    ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][new Date().getDay()];

export const DAY_WEEK = getDayWeek();

export const TASK_REPORT = 'tasks-report';

export const getValues = (items, valCb) => items?.map((item) => valCb(item)).join('');

export const number = {
    get random() {
        const arr = [];
        while(arr.length < 2){
            const r = Math.floor(Math.random() * 100) + 1;
            if(arr.indexOf(r) === -1) arr.push(r);
        }
        return arr[1];
    }
};

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

export const getTaskListItemBody = (item) => `
            <li class="result-task-list__item">
                <i class="result-task-list__item-content" data-content="${item.id}">${item.value.trim()}</i>
                <span class="result-task-list__item-close" id="${item.id}">X</span>
            </li>`
