import {getValues, getDayWeek, writeClipboard, storage} from './utils.js'

export default class TaskReport {
    constructor(options) {
        this.$ = (id) => document.getElementById(id)
        this.form = document.forms[0].elements;
        this.result = this.$(options.result);
        this.clearBtn = this.$(options.clear);
        this.copyBtn = this.$(options.copy);
        this.taskList = this.$(options.taskList);
        this.storageTasks = this.getStorageTasks;
        this.changeResult = {};

        this.init = this.init.bind(this);
        this.render = this.render.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.changeItem = this.changeItem.bind(this);
        this.getTaskItems = this.getTaskItems.bind(this);
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
        const start = this.storageTasks()
        for (const key in start) {
            if (start[key] !== e.target.id) {
                result[key] = start[key];
            }
        }
        storage.set('tasks-report', result)
        this.render(result);
        if (!Object.keys(result).length) {
            this.render();
        }
    }
    changeItem(e) {
        const itemDataSet = e.target.dataset.content;
        const tasks = this.storageTasks();
        delete tasks[itemDataSet];
        console.log(tasks, itemDataSet)
        e.target.contentEditable = true
        e.target.focus();
        const handler = (event) => {
            this.changeResult[event.target.textContent] = event.target.textContent
            console.log('input',this.changeResult)
        }
        const blur = () => {
            console.log('blur', Object.keys(this.changeResult)[0])
            tasks[Object.keys(this.changeResult)[0]] = Object.keys(this.changeResult)[0]
            storage.set('tasks-report', tasks)
            this.render(tasks);
            e.target.removeEventListener('input', handler)
            e.target.removeEventListener('blur', blur)
            this.changeResult = {};
            e.target.contentEditable = true
        }
        e.target.addEventListener('blur', blur)
        e.target.addEventListener('input', handler)
    }

    getTaskItemBody(val) {
        return `
            <li class="result-task-list__item">
                <i data-content="${val}">${val}</i>
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

    taskListHandler(e) {
        if (e.target.closest('.result-task-list__item-close')) {
            this.deleteItem(e)
        }
        if (e.target.closest('.result-task-list__item > i')) {
            this.changeItem(e)
        }
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
        this.taskList.addEventListener('click', this.taskListHandler.bind(this))
    }
}