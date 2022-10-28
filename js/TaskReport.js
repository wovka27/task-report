import {getValues, getDayWeek, writeClipboard, storage, addHandlers, getTaskListItemBody} from './utils.js'

export default class TaskReport {
    #tasksReport = 'tasks-report';
    #dayWeek = getDayWeek();
    #number = {
        get random() {
            const arr = [];
            while(arr.length < 2){
                const r = Math.floor(Math.random() * 100) + 1;
                if(arr.indexOf(r) === -1) arr.push(r);
            }
            return arr[1];
        }
    };
    constructor(options = {}) {
        this.form = options.form.element;
        this.input = options.form.input;
        this.addBtn = options.form.addBtn;
        this.taskList = options.taskList.element;
        this.deleteItemBtn = options.taskList.deleteItemBtn;
        this.taskValueItem = options.taskList.taskValueItem;
        this.clearBtn = options.form.clearBtn;
        this.copyBtn = options.form.copyBtn;
        this.storageTasks = this.getStorageTasks;

        this.renderTasksList = this.renderTasksList.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.changeItem = this.changeItem.bind(this);
        this.getTaskItems = this.getTaskItems.bind(this)
        this.addTask = this.addTask.bind(this);
        this.deleteStorageTasks = this.deleteStorageTasks.bind(this);
        this.changeItem = this.changeItem.bind(this);

        const tasks = this.storageTasks()
        this.input.value = null;
        if (tasks) {
            this.renderTasksList(tasks)
        }
        document.body.addEventListener('click', this.clickHandler.bind(this))
    }

    getStorageTasks() {
        return storage.get(this.#tasksReport);
    }

    setStorageTask(value) {
        storage.set('tasks-report', [...new Set([...this.storageTasks() ?? [], {...value}])]);
        this.renderTasksList(this.storageTasks())
    }

    copy(e) {
        e.preventDefault();
        writeClipboard(`${this.#dayWeek}:\n${getValues(this.storageTasks(), (item) =>` - ${item.value}\n`)
        }`).then();
    }

    deleteStorageTasks(e) {
        e.preventDefault();
        storage.delete(this.#tasksReport);
        this.renderTasksList();
    }

    addTask(e) {
        e.preventDefault();
        if (!this.input.value || this.input.value === ' ') {
           return;
        }
        this.setStorageTask({id: this.#number.random, value: this.input.value.trim()})
        this.input.value = null;
    }

    deleteItem(e) {
        const tasks = this.storageTasks()
        const result = tasks.filter(item => item.id !== +e.target.id)
        storage.set(this.#tasksReport, result)

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

        const handler = (event) => {
            task.value = event.target.innerText;
        }
        const blur = () => {
            const items = [...new Set([...tasks, task])]
            storage.set('tasks-report', items)
            this.renderTasksList(items)
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

    getTaskItemBody(val) {
        return getTaskListItemBody(val)
    }

    getTaskItems(tasks) {
       return getValues(tasks, (item) => this.getTaskItemBody(item))
    }

    renderTasksList(tasks = '') {
        this.taskList.innerHTML = tasks && this.getTaskItems(tasks)
    }

    clickHandler(e) {
        switch (e.target) {
            case e.target.closest('.' + this.deleteItemBtn):
                this.deleteItem(e);
                break;
            case e.target.closest('.' + this.taskValueItem):
                this.changeItem(e);
                break;
            case e.target.closest(this.addBtn):
                this.addTask(e);
                break;
            case e.target.closest(this.clearBtn):
                this.deleteStorageTasks(e);
                break;
            case e.target.closest(this.copyBtn):
                this.copy(e);
                break;
            default:
                return;
        }
    }
}