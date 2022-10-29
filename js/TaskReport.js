import {getValues, DAY_WEEK, writeClipboard, storage, getTaskListItemBody, TASK_REPORT, number} from './utils.js'

export default class TaskReport {

    constructor(options = {}) {
        this.input = options.form.input;
        this.form = options.form.element;
        this.addBtn = options.form.addBtn;
        this.copyBtn = options.form.copyBtn;
        this.clearBtn = options.form.clearBtn;
        this.taskList = options.taskList.element;
        this.deleteItemBtn = options.taskList.deleteItemBtn;
        this.taskValueItem = options.taskList.taskValueItem;

        this.storageTasks = this.getStorageTasks;

        this.addTask = this.addTask.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.changeItem = this.changeItem.bind(this);
        this.changeItem = this.changeItem.bind(this);
        this.getTaskItems = this.getTaskItems.bind(this)
        this.getChangeTask = this.getChangeTask.bind(this);
        this.renderTasksList = this.renderTasksList.bind(this);
        this.deleteStorageTasks = this.deleteStorageTasks.bind(this);

        const tasks = this.storageTasks()
        this.input.value = null;
        if (tasks) {
            this.renderTasksList(tasks)
        }
        document.body.addEventListener('click', this.clickHandler.bind(this))
    }

    getChangeTask(type , cb) {
        const tasks = this.storageTasks()
        const result = tasks[type](item => cb(item))

        return {tasks, result}
    }

    setEventListeners(target, handlers = [], type = true) {
        const eventNames = ['input', 'keydown', 'blur'];
        if (type) {
            eventNames.forEach((name, index) => target.addEventListener(name, handlers[index]));
        } else {
            eventNames.forEach((name, index) => target.removeEventListener(name, handlers[index]));
        }
    }

    getStorageTasks() {
        return storage.get(TASK_REPORT);
    }

    setStorageTask(value) {
        storage.set(TASK_REPORT, [...new Set([...this.storageTasks() ?? [], value])]);
        this.renderTasksList(this.storageTasks())
    }

    copy(e) {
        e.preventDefault();
        writeClipboard(`${DAY_WEEK}:\n${getValues(this.storageTasks(), (item) =>` - ${item.value}\n`)
        }`).then();
    }

    deleteStorageTasks(e) {
        e.preventDefault();
        storage.delete(TASK_REPORT);
        this.renderTasksList();
    }

    addTask(e) {
        e.preventDefault();
        if (!this.input.value || this.input.value === ' ') {
           return;
        }
        this.setStorageTask({id: number.random, value: this.input.value.trim()})
        this.input.value = null;
    }

    deleteItem(e) {
        const {tasks, result} = this.getChangeTask('filter', item => item.id !== +e.target.id)
        storage.set(TASK_REPORT, result)

        if (!tasks.length) {
            this.renderTasksList();
        }
        this.renderTasksList(result);
    }

    changeItem(e) {
        const {tasks, result} = this.getChangeTask('find', item => item.id === +e.target.dataset.content)
        e.target.contentEditable = true
        e.target.focus();

        const handler = (event) => {
            result.value = event.target.innerText;
        }
        const blur = () => {
            const items = [...new Set([...tasks, result])]
            storage.set(TASK_REPORT, items)
            this.renderTasksList(items)
            this.setEventListeners(e.target, [handler, keyDown, blur], false)
            e.target.contentEditable = false;
        }

        const keyDown = (e) => e.code === 'Enter' && blur()
        this.setEventListeners(e.target, [handler, keyDown, blur])
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
            case e.target.closest(this.deleteItemBtn):
                this.deleteItem(e);
                break;
            case e.target.closest(this.taskValueItem):
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
