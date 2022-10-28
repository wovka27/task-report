import {getValues, getDayWeek, writeClipboard, storage, number, addHandlers, gettaskListItemBody} from './utils.js'

export default class TaskReport {
    constructor(options) {
        this.form = document.forms[0].elements;
        this.taskList = document.getElementById(options.taskList);
        this.storageTasks = this.getStorageTasks;

        this.init = this.init.bind(this);
        this.renderTasksList = this.renderTasksList.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.changeItem = this.changeItem.bind(this);
        this.getTaskItems = this.getTaskItems.bind(this)
        this.addTask = this.addTask.bind(this);
        this.deleteStorageTasks = this.deleteStorageTasks.bind(this);
        this.changeItem = this.changeItem.bind(this);
    }

    getStorageTasks() {
        return storage.get('tasks-report');
    }

    setStorageTask(value) {
        storage.set('tasks-report', [...new Set([...this.storageTasks() ?? [], {...value}])]);
        this.renderTasksList(this.storageTasks())
    }

    copy(e) {
        e.preventDefault();
        writeClipboard(`${
            getDayWeek()}:\n${getValues(this.storageTasks(), (item) =>` - ${item.value}\n`)
        }`).then()
    }

    deleteStorageTasks(e) {
        e.preventDefault();
        storage.delete('tasks-report');
        this.renderTasksList();
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

        if (!tasks.length) {
            this.renderTasksList();
        }
        this.renderTasksList(result);
    }
    changeItem(e) {
        const tasks = this.storageTasks();
        const task = tasks.find(item => item.id === +e.target.dataset.content)
        e.target.contentEditable = true
        e.target.focus();

        addHandlers(e, task, tasks, this.renderTasksList);
    }

    getTaskItemBody(val) {
        return gettaskListItemBody(val)
    }

    getTaskItems(tasks) {
       return getValues(tasks, (item) => this.getTaskItemBody(item))
    }

    renderTasksList(tasks = '') {
        this.taskList.innerHTML = tasks && this.getTaskItems(tasks)
    }

    clickHandler(e) {
        switch (e.target) {
            case e.target.closest('.result-task-list__item-close'):
                this.deleteItem(e);
                break;
            case e.target.closest('.result-task-list__item > i'):
                this.changeItem(e);
                break;
            case e.target.closest('form button[name="btn"]'):
                this.addTask(e);
                break;
            case e.target.closest('form #clear'):
                this.deleteStorageTasks(e);
                break;
            case e.target.closest('.form #copy'):
                this.copy(e);
                break;
            default:
                return;
        }
    }

    init() {
        const tasks = this.storageTasks()
        if (tasks) {
            this.renderTasksList(tasks)
        }
        document.body.addEventListener('click', this.clickHandler.bind(this))
    }
}