import {getValues, getDayWeek, writeClipboard, storage, number} from './utils.js'

export default class TaskReport {
    constructor(options) {
        this.$ = (id) => document.getElementById(id)
        this.form = document.forms[0].elements;
        this.clearBtn = this.$(options.clear);
        this.copyBtn = this.$(options.copy);
        this.taskList = this.$(options.taskList);
        this.storageTasks = this.getStorageTasks;

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
        storage.set('tasks-report', [...new Set([...this.storageTasks() ?? [], {...value}])]);
        this.render(this.storageTasks())
    }

    copy(e) {
        e.preventDefault();
        writeClipboard(`${
            getDayWeek()}\n${getValues(this.storageTasks(), (item) =>` - ${item.value}\n`)
        }`).then()
    }

    deleteStorageTasks(e) {
        e.preventDefault();
        storage.delete('tasks-report');
        this.render();
    }

    addTask(e) {
        e.preventDefault();
        this.setStorageTask({id: number.random, value:this.form[0].value.trim()})
        this.form[0].value = '';
    }

    deleteItem(e) {
        const tasks = this.storageTasks()
        const result = tasks.filter(item => item.id !== +e.target.id)
        storage.set('tasks-report', result)
        this.render(result);
        if (!tasks.length) {
            this.render();
        }
    }
    changeItem(e) {
        const itemDataSet = e.target.dataset.content;
        const tasks = this.storageTasks();
        const task = tasks.find(item => item.id === +itemDataSet)
        e.target.contentEditable = true
        e.target.focus();

        const handler = (event) => {
            task.value = event.target.innerText;
        }
        const blur = () => {
            const items = [...new Set([...tasks, task])]
            storage.set('tasks-report', items)
            this.render(items)
            e.target.removeEventListener('input', handler)
            e.target.removeEventListener('keydown', keyDown)
            e.target.removeEventListener('blur', blur)
            e.target.contentEditable = false;
        }

        const keyDown = (e) => {
            if (e.code === 'Enter' && e.ctrlKey) {
                blur()
            }
        }
        e.target.addEventListener('blur', blur)
        e.target.addEventListener('keydown', keyDown)
        e.target.addEventListener('input', handler)
    }

    getTaskItemBody(val) {
        return `
            <li class="result-task-list__item">
                <i data-content="${val.id}">${val.value.trim()}</i>
                <span class="result-task-list__item-close" id="${val.id}">X</span>
            </li>`
    }

    getTaskItems(tasks) {
       return getValues(tasks, (item) => this.getTaskItemBody(item))
    }


    render(tasks= '') {
        this.renderTasksList(tasks)
    }

    renderTasksList(tasks = '') {
        this.taskList.innerHTML = tasks && this.getTaskItems(tasks)
    }

    taskListHandler(e) {
        switch (e.target) {
            case e.target.closest('.result-task-list__item-close'):
                this.deleteItem(e);
            case e.target.closest('.result-task-list__item > i'):
                this.changeItem(e)
            default:
                return;
        }
    }

    init() {
        const tasks = this.storageTasks()
        if (tasks) {
            this.renderTasksList(tasks)
        }

        this.form[1].addEventListener('click', this.addTask.bind(this))
        this.clearBtn.addEventListener('click', this.deleteStorageTasks.bind(this));
        this.copyBtn.addEventListener('click', this.copy.bind(this));
        this.taskList.addEventListener('click', this.taskListHandler.bind(this))
    }
}