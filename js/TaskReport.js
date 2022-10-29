import {
    DAY_WEEK,
    getChangeTask,
    getValues,
    setEventListeners,
    setStorageTask,
    storage,
    TASK_REPORT,
    writeClipboard
} from './utils.js'
import Message from "./Message.js";

export default class TaskReport {

    constructor(options = {}) {
        this.input = options.form.input;
        this.form = options.form.element;
        this.addBtn = options.form.addBtn;
        this.copyBtn = options.form.copyBtn;
        this.clearBtn = options.form.clearBtn;
        this.taskList = options.taskList.element;
        this.taskItem = options.taskList.taskItem.className;
        this.deleteItemBtn = options.taskList.taskItem.deleteItemBtn;
        this.taskValueItem = options.taskList.taskItem.taskValueItem;

        this.storageTasks = this.getStorageTasks;
        this.message = new Message();

        this.addTask = this.addTask.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.changeItem = this.changeItem.bind(this);
        this.changeItem = this.changeItem.bind(this);
        this.controlAnimation = this.controlAnimation.bind(this);
        this.createTask = this.createTask.bind(this)
        this.renderTasksList = this.renderTasksList.bind(this);
        this.deleteStorageTasks = this.deleteStorageTasks.bind(this);

        const tasks = this.storageTasks()
        this.input.value = null;
        if (tasks) {
            this.renderTasksList(tasks)
        }
        document.body.addEventListener('click', this.clickHandler.bind(this))
    }

    getStorageTasks() {
        return storage.get(TASK_REPORT);
    }

    get taskListEmpty() {
        const tasks = this.storageTasks()
        if (!tasks || tasks.length === 0) {
            return true;
        } else {
            return false
        }
    }

    async copy(e) {
        e.preventDefault();
        const tasks = this.storageTasks();
        if (!tasks || tasks.length === 0) {
            this.message.showMessage('Не удалось скопировать. Список пуст.');
            return;
        }
        try {
            await writeClipboard(`${DAY_WEEK}:\n${getValues(tasks, (item) => ` - ${item.value}\n`)}`)
            this.message.showMessage('Успешно скопировано');
        } catch (e) {
            this.message.showMessage('Не удалось скопировать');
        }
    }

    deleteStorageTasks(e) {
        e.preventDefault();
        if (this.taskListEmpty) {
            this.message.showMessage('Список пуст')
            return;
        }
        storage.delete(TASK_REPORT);
        this.renderTasksList();
        this.message.showMessage('Очищено');
    }

    addTask(e) {
        e.preventDefault();
        if (!this.input.value || this.input.value === ' ') {
            return;
        }

        setStorageTask({id: Date.now(), value: this.input.value.trim()}, this.renderTasksList)
        this.controlAnimation(this.taskList.children.length - 1, 'add');
        this.input.value = null;
    }

    deleteItem(e) {
        const {result} = getChangeTask('filter', item => item.id !== +e.target.id)
        storage.set(TASK_REPORT, result)
        const index = Array.from(this.taskList.children).findIndex(item => item.children[1].id === e.target.id)
        this.controlAnimation(index, 'delete');
    }

    changeItem(e) {
        const {tasks, result} = getChangeTask('find', item => item.id === +e.target.dataset.content)
        e.target.contentEditable = true
        e.target.focus();

        const handler = (event) => {
            result.value = event.target.innerText;
        }
        const blur = () => {
            const items = [...new Set([...tasks, result])]
            storage.set(TASK_REPORT, items)
            this.renderTasksList(items)
            setEventListeners(e.target, [handler, keyDown, blur], true)
            e.target.contentEditable = false;
            this.message.showMessage('Изменено');
        }

        const keyDown = (e) => e.code === 'Enter' && blur()
        setEventListeners(e.target, [handler, keyDown, blur])
    }

    controlAnimation(index, actionAnim, delay = 200) {
        const item = this.taskList.children[index];
        item?.classList.add(`animated-${actionAnim}`);
        setTimeout(() => {
            item?.classList.remove(`animated-${actionAnim}`)
            if (actionAnim === 'delete') {
                this.taskList.removeChild(this.taskList.children[index])
            }
        }, delay)
    }

    createTask(item) {
        if (!item) {
            return;
        }

        const li = document.createElement('li');
        const i = document.createElement('i');
        const span = document.createElement('span');
        li.className = this.taskItem
        i.classList.add(this.taskValueItem.replace('.', ''))
        i.setAttribute('data-content', item.id);
        i.textContent = item.value;
        span.classList.add(this.deleteItemBtn.replace('.', ''))
        span.textContent = 'X';
        span.id = item.id;
        [i, span].forEach(item => li.appendChild(item))
        this.taskList.appendChild(li);
    }

    renderTasksList(tasks = []) {
        this.taskList.innerHTML = '';
        tasks.forEach(item => this.createTask(item))
    }

    async clickHandler(e) {
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
                await this.copy(e);
                break;
            default:
                return;
        }
    }
}
