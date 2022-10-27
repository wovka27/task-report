export default class TaskReport {
    /**
     * @param options ID's
     */
    constructor(options) {
        this.form = document.forms[0].elements;
        this.result = document.getElementById(options.result);
        this.clearBtn = document.getElementById(options.clear);
        this.copyBtn = document.getElementById(options.copy);
        this.taskList = document.getElementById(options.taskList);
        this.storageTasks = this.getStorageTasks;

        this.writeClipboard = this.writeClipboard.bind(this);
        this.getTaskItems = this.getTaskItems.bind(this);
        this.init = this.init.bind(this);
        this.render = this.render.bind(this);

    }

    getStorageTasks() {
        return JSON.parse(localStorage.getItem('tasks-report'));
    }

    setStorageTask(value) {
        const tasks = this.storageTasks()
        localStorage.setItem('tasks-report', JSON.stringify(Object.assign(tasks || {}, value)));
        this.render(this.storageTasks())
    }

    copy(e) {
        e.preventDefault();
        this.writeClipboard().then()
    }

    async writeClipboard() {
        if (!Boolean(this.result.innerText)) {
            return;
        }

        try {
            await navigator.clipboard.writeText(this.result.innerText)
            alert('Текст скопирован!');
        } catch (e) {
            alert('Не удалось скопировать!');
        }
    }

    deleteStorageTasks(e) {
        e.preventDefault();
        localStorage.removeItem('tasks-report');
        this.render();
    }

    getTaskValues(tasks) {
        let result = ''
        for (const key in tasks) {
            result += ` - ${tasks[key]}<br />`;
        }
        return result
    }

    getDayWeek() {
        const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        return days[new Date().getDay()];
    }

    addTask(e) {
        e.preventDefault();
        const tasks = {}
        tasks[this.form[0].value] = this.form[0].value;
        this.setStorageTask(tasks)
        this.form[0].value = '';
    }

    deleteItem(e) {
        const result = {};
        if (e.target.closest('.result-task-list__item-close')) {
            const tasks = Object.entries(this.storageTasks()).filter(([key, _]) => key !== e.target.id).join('');
            for (const [key, val] in tasks) {
                result[key] = val;
            }
            this.setStorageTask(Object.assign(this.storageTasks(), result))
        }
    }

    getTaskItemBody(val) {
        return `
            <li class="result-task-list__item">
                <i contenteditable data-content="${val}">${val}</i>
                <span class="result-task-list__item-close" id="${val}">X</span>
            </li>`
    }

    getTaskItems(tasks) {
        let result = ''
        for (const key in tasks) {
            result += this.getTaskItemBody(tasks[key]);
        }
        return result;
    }

    render(tasks= '') {
        this.renderTasks(tasks)
        this.renderTasksList(tasks)
    }

    renderTasksList(tasks = '') {
        this.taskList.innerHTML = tasks && this.getTaskItems(tasks)
    }

    renderTasks(tasks = '') {
        this.result.innerHTML = tasks && `${this.getDayWeek()}:<br />${this.getTaskValues(tasks)}`;
    }

    init() {
        const tasks = this.storageTasks()
        if (tasks) {
            this.renderTasksList(tasks)
            this.renderTasks(tasks);
        }

        this.form[1].addEventListener('click', this.addTask.bind(this))
        this.clearBtn.addEventListener('click', this.deleteStorageTasks.bind(this));
        this.copyBtn.addEventListener('click', this.copy.bind(this));
        this.taskList.addEventListener('click', this.deleteItem.bind(this))
    }
}