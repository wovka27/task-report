export const getDayWeek = () =>
    ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][new Date().getDay()];

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