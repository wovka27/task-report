import {
    afterAnimationEnd,
    DAY_WEEK,
    getChangeTask,
    getValues, noDuplicate,
    setEventListeners,
    setStorageTask,
    storage,
    TASK_REPORT, useStorage,
    writeClipboard
} from './utils.js'
import Message from "./Message.js";

export default class TaskReport {

    /**
     *
     * @param options {{
     * form:{
     *      element: HTMLFormElement,
     *      input: HTMLInputElement,
     *      addBtn: string,
     *      clearBtn: string,
     *      copyBtn: string,
     * };
     * taskList:{
     *     element: HTMLElement | null,
     *     taskItem: {
     *         className: string,
     *         deleteItemBtn: string,
     *         taskValueItem: string
     *     }
     * }}
     * }
     */
    constructor(options = {}) {
        this.form = options.form.element;
        this.input = options.form.input;
        this.addBtn = options.form.addBtn;
        this.copyBtn = options.form.copyBtn;
        this.clearBtn = options.form.clearBtn;
        this.taskList = options.taskList.element;
        this.taskItem = options.taskList.taskItem.className;
        this.deleteItemBtn = options.taskList.taskItem.deleteItemBtn;
        this.taskValueItem = options.taskList.taskItem.taskValueItem;

        this.message = new Message();

        this.addTask = this.addTask.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.changeItem = this.changeItem.bind(this);
        this.changeItem = this.changeItem.bind(this);
        this.controlAnimation = this.controlAnimation.bind(this);
        this.createTask = this.createTask.bind(this)
        this.renderTasksList = this.renderTasksList.bind(this);
        this.deleteStorageTasks = this.deleteStorageTasks.bind(this);
        this.keyDownHandler = this.keyDownHandler.bind(this);

        const {data} = useStorage();
        this.input.value = null;
        if (data) {
            this.renderTasksList(data)
        }
        document.body.addEventListener('click', this.clickHandler.bind(this))
        document.body.addEventListener('keydown', this.keyDownHandler);
    }

    get taskListEmpty() {
        const {data} = useStorage();
        return !data || data.length === 0;
    }

    /**
     *
     * @param e{Event}
     * @returns {Promise<void>}
     */
    async copy(e) {
        e.preventDefault();
        const {data} = useStorage();
        if (!data || data.length === 0) {
            this.message.showMessage('Не удалось скопировать. Список пуст.');
            return;
        }
        try {
            await writeClipboard(`${DAY_WEEK}:\n${getValues(data, (item) => ` - ${item.value}\n`)}`)
            this.message.showMessage('Успешно скопировано');
        } catch (e) {
            this.message.showMessage('Не удалось скопировать');
        }
    }

    /**
     *
     * @param e{Event}
     */
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

    /**
     *
     * @param e{Event}
     */
    addTask(e) {
        if (!this.input.value || this.input.value === ' ') {
            return;
        }
        e.preventDefault();
        setStorageTask({id: Date.now(), value: this.input.value}, this.renderTasksList)
        this.controlAnimation(this.taskList.children.length - 1, 'add');
        this.input.value = null;
    }

    /**
     *
     * @param e{Event}
     */
   deleteItem(e) {
        const { setResult, result } = getChangeTask('filter', item => item.id !== +e.target.id)
        setResult();
        const index = Array.from(this.taskList?.children).findIndex(item => item.children[1].id === e.target.id)
        this.controlAnimation(index, 'delete');
        afterAnimationEnd(end => end && this.renderTasksList(result));
    }

    /**
     *
     * @param e{Event}
     */
    changeItem(e) {
        const {tasks, result, setResult} = getChangeTask('find', item => item.id === +e.target.dataset.content)
        e.target.contentEditable = true
        const handler = (event) => {
            result.value = event.target.innerText + '\n';
        }
        const blur = (e) => {

            const items = noDuplicate([...tasks, result])
            setResult(items);
            this.renderTasksList(items);
            setEventListeners(e.target, [handler, keyDown, blur], true)
            e.target.contentEditable = false;
            this.message.showMessage('Изменено');
        }

        const keyDown = (e) => !Boolean(e.code === 'Enter' && e.shiftKey) && e.code === 'Enter'  && blur(e)
        setEventListeners(e.target, [handler, keyDown, blur])
    }

    /**
     * Контроль за анимацией
     *
     * @param index{number}
     * @param actionAnim{string}
     */
    controlAnimation(index, actionAnim) {
        const item = this.taskList?.children[index];
        item?.classList.add(`animated-${actionAnim}`);
        afterAnimationEnd(end => {
            if (end) {
                item?.classList.remove(`animated-${actionAnim}`)
                if (actionAnim === 'delete') {
                    this.taskList.removeChild(this.taskList.children[index])
                }
            }
        })
    }

    /**
     *
     * @param item{{value: string; id: number | string} | null}
     */
    createTask(item) {
        if (!item) {
            return;
        }

        const li = document.createElement('li');
        const i = document.createElement('p');
        const span = document.createElement('span');
        li.className = this.taskItem
        i.classList.add(this.taskValueItem.replace('.', ''))
        i.setAttribute('data-content', item.id);
        i.title = 'Нажмите для изменения'
        i.textContent = item.value;
        span.classList.add(this.deleteItemBtn.replace('.', ''))
        span.textContent = 'X';
        span.title = 'Удалить'
        span.id = item.id;
        [i, span].forEach(item => li.appendChild(item))
        this.taskList.appendChild(li);
    }

    /**
     *
     * @param tasks {({id: (number|string), value: string}|Array<{id: (number|string), value: string}>)[]}
     */
    renderTasksList(tasks) {
        this.taskList.innerHTML = '';
        this.taskList.classList.remove('empty');

        if (tasks === null || tasks.length === 0) {
            this.taskList.classList.add('empty');
            this.taskList.innerHTML = '<p>Список пуст.</p>';
            return
        }
        tasks.forEach(item => this.createTask(item));
    }

    /**
     *
     * @param e {KeyboardEvent}
     */
    keyDownHandler(e) {
        if (!Boolean(e.code === 'Enter' && e.shiftKey) && e.code === 'Enter' && this.input.value.length !== 0) {
            this.addTask(e);
        }
    }

    /**
     *
     * @param e{Event}
     * @returns {Promise<void>}
     */
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
