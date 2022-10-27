import {getValues, getDayWeek, writeClipboard, storage} from './utils.js'

export default class TaskReport {
    /**
     * @param options ID's
     */
    constructor(options) {
        this.$ = (id) => document.getElementById(id)
        this.form = document.forms[0].elements;
        this.result = this.$(options.result);
        this.clearBtn = this.$(options.clear);
        this.copyBtn = this.$(options.copy);
        this.taskList = this.$(options.taskList);
        this.storageTasks = this.getStorageTasks;

        this.getTaskItems = this.getTaskItems.bind(this);
        this.init = this.init.bind(this);
        this.render = this.render.bind(this);
    }

    getStorageTasks() {
        return storage.get('tasks-report');
    }

    setStorageTask(value) {
        const tasks = this.storageTasks()
        storage.set('tasks-report', Object.assign(tasks || {}, value));
        this.render(this.storageTasks())
    }

    copy(e) {
        e.preventDefault();
        writeClipboard(this.result.innerText).then()
    }

    deleteStorageTasks(e) {
        e.preventDefault();
        storage.delete('tasks-report');
        this.render();
    }

    getTaskValues(tasks) {
        return getValues(tasks, (key) =>` - ${tasks[key]}<br />`)
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
       return getValues(tasks, (key) => this.getTaskItemBody(tasks[key]))
    }

    render(tasks= '') {
        this.renderTasks(tasks)
        this.renderTasksList(tasks)
    }

    renderTasksList(tasks = '') {
        this.taskList.innerHTML = tasks && this.getTaskItems(tasks)
    }

    renderTasks(tasks = '') {
        this.result.innerHTML = tasks && `${getDayWeek()}:<br />${this.getTaskValues(tasks)}`;
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