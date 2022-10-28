export const getDayWeek = () =>
    ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][new Date().getDay()];

export const getValues = (items, valCb) => items.map((item) => valCb(item)).join('');

export const $id = (id) => document.getElementById(id);

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