import {
    afterAnimationEnd,
    ARCHIVE_LISTS,
    date,
    DAY_WEEK,
    getChangeTask,
    getValues,
    noDuplicate, scrollArchive,
    setEventListeners,
    setStorageTask,
    storage,
    TASK_REPORT, textDivider,
    useStorage,
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
        this.input = options.form.input;
        this.addBtn = options.form.addBtn;
        this.copyBtn = options.form.copyBtn;
        this.clearBtn = options.form.clearBtn;
        this.taskList = options.taskList.element;
        this.taskItem = options.taskList.taskItem.className;
        this.deleteItemBtn = options.taskList.taskItem.deleteItemBtn;
        this.taskValueItem = options.taskList.taskItem.taskValueItem;
        this.archive = document.getElementsByClassName('archive-lists')[0];

        this.message = new Message();

        this.addTask = this.addTask.bind(this)
        this.deleteItem = this.deleteItem.bind(this);
        this.changeItem = this.changeItem.bind(this);
        this.changeItem = this.changeItem.bind(this);
        this.controlAnimation = this.controlAnimation.bind(this);
        this.createTask = this.createTask.bind(this)
        this.renderTasksList = this.renderTasksList.bind(this);
        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.renderArchive = this.renderArchive.bind(this);
        this.viewArchiveTasks = this.viewArchiveTasks.bind(this);

        const {data} = useStorage();
        this.input.value = null;
        this.renderTasksList(data)
        this.renderArchive();
        scrollArchive('.' + this.archive.className, (isScroll) => {
            const items = document.querySelectorAll('.archive-target')
            console.log(isScroll)
            items.forEach(item => {
                if (isScroll) {
                    item.style.pointerEvents = 'none';
                } else {
                    item.style.pointerEvents = 'auto';
                }
            })
        })

        document.body.addEventListener('click', this.clickHandler.bind(this))
        document.body.addEventListener('keydown', this.keyDownHandler);
    }

    get taskListEmpty() {
        const {data} = useStorage();
        return !data || data.length === 0;
    }

    /**
     *
     * @param e{MouseEvent}
     * @returns {Promise<void>}
     */
    async copy(e) {
        let self = this;
        e.preventDefault();
        const {data} = useStorage();
        if (!data || data.length === 0) {
            self.message.showMessage('Не удалось скопировать. Список пуст.');
            return;
        }
        try {
            await writeClipboard(`${DAY_WEEK}:\n${getValues(data, (item) => ` - ${textDivider(item.value)}\n`)}`);
            await self.saveTasksListToArchive(data);
            await self.renderArchive();
            self.message.showMessage('Успешно скопировано');
        } catch (e) {
            self.message.showMessage(`Не удалось скопировать, ${e}`);
        }
    }

    /**
     *
     * @param e{MouseEvent}
     */
    deleteStorageTasks(e) {
        e.preventDefault();
        if (this.taskListEmpty) {
            this.message.showMessage('Список пуст')
            return;
        }
        Array.from(this.taskList?.children).forEach((_, index) => {
            this.controlAnimation(index, 'delete');
        });
        storage.delete(TASK_REPORT);
        afterAnimationEnd(end => end && this.renderTasksList(storage.get(TASK_REPORT)));
        this.message.showMessage('Очищено');
    }

    /**
     *
     * @param e{MouseEvent}
     */
    addTask(e) {

        if (!this.input.value || this.input.value === ' ') {
            return;
        }
        e.preventDefault();
        setStorageTask({id: Date.now(), value: this.input.value}, this.renderTasksList)
        this.controlAnimation(this.taskList.children.length - 1, 'add')
        const {data} = useStorage()
        this.saveTasksListToArchive(data);
        this.renderArchive();
        this.input.value = null;
    }

    /**
     *
     * @param e{MouseEvent}
     */
    deleteItem(e) {
        const {setResult, result} = getChangeTask('filter', item => item.id !== +e.target.id)
        setResult();
        const index = Array.from(this.taskList?.children).findIndex(item => item.children[1].id === e.target.id)
        this.controlAnimation(
            index,
            'delete',
            (item, actionAnim) => actionAnim === 'delete' && this.taskList.removeChild(item)
        );
        afterAnimationEnd(end => end && this.renderTasksList(result));
    }

    /**
     *
     * @param e{MouseEvent}
     */
    changeItem(e) {
        const {tasks, result, setResult} = getChangeTask('find', item => item.id === +e.target.dataset.content)
        e.target.contentEditable = true
        const handler = (event) => {
            result.value = event.target.innerText;
        }
        const blur = (e) => {

            const items = noDuplicate([...tasks, result])
            setResult(items);
            this.renderTasksList(items);
            setEventListeners(e.target, [handler, keyDown, blur], true)
            e.target.contentEditable = false;
            this.message.showMessage('Изменено');
        }

        const keyDown = (e) => !Boolean(e.code === 'Enter' && e.shiftKey) && e.code === 'Enter' && blur(e)
        setEventListeners(e.target, [handler, keyDown, blur])
    }

    /**
     * Контроль за анимацией
     *
     * @param index{number}
     * @param actionAnim{string}
     * @param {(item: HTMLElement, actionAnim: string) => unknown | null} [cb]
     */
    controlAnimation(index, actionAnim, cb) {
        const item = this.taskList?.children[index];
        item?.classList.add(`animated-${actionAnim}`);
        afterAnimationEnd(end => {
            if (end) {
                item?.classList.remove(`animated-${actionAnim}`)
                cb?.(item, actionAnim);
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
        span.classList.add(this.deleteItemBtn.replace('.', ''));
        span.title = 'Удалить';
        span.textContent = '';
        span.id = item.id;
        [i, span].forEach(item => li.appendChild(item))
        this.taskList.appendChild(li);
    }

    /**
     *
     * @param tasks {({id: (number|string), value: string}|Array<{id: (number|string), value: string}>)[]}
     * @param {function} [cb]
     */
    renderTasksList(tasks, cb = () => null) {
        this.taskList.innerHTML = '';
        tasks?.forEach((item, index) => {
            this.createTask(item)
            cb(index)
        });
    }

    /**
     *
     * @param e {KeyboardEvent | MouseEvent}
     */
    keyDownHandler(e) {
        if (!Boolean(e.code === 'Enter' && e.shiftKey) && e.code === 'Enter' && this.input.value.length !== 0) {
            this.addTask(e);
        }
    }

    saveTasksListToArchive(tasks) {
        const {setData, data} = useStorage(ARCHIVE_LISTS);
        const todayArchive = data?.find(item => item.today === date.today);
        if (!todayArchive) {
            setData(noDuplicate([...data ?? [], {...date, tasks}]))
        } else {
            setData(noDuplicate([...data.filter(i => i.today !== date.today) ?? [], {...date, tasks}]))
        }
    }

    renderArchive() {
        const {data} = useStorage(ARCHIVE_LISTS);
        this.archive.innerHTML = data?.map(item => `
            <li class="archive-lists__list archive-target" data-tasks="${item.today}">
                <p class="archive-lists__list-date archive-target" data-tasks="${item.today}">${item.today}</p>
                <p class="archive-lists__list-content archive-target" data-tasks="${item.today}">${item.tasks[0].value === ('' || '\n') ? '...' : item.tasks[0].value}</p>
                <span class="archive-lists__list-close archive-delete" data-tasks="${item.today}"></span>
            </li>`
        ).join('');
    }

    viewArchiveTasks(e) {
        const {setData} = useStorage()
        const {data} = useStorage(ARCHIVE_LISTS);
        const filterData = data.find(item => item.today === e.target.dataset.tasks);
        setData(filterData.tasks);
        this.renderTasksList(filterData.tasks, index => this.controlAnimation(index, 'add'));
    }

    deleteArchive(e) {
        e.stopPropagation();
        const {data, setData} = useStorage(ARCHIVE_LISTS);
        const filterData = data.filter(item => item.today !== e.target.dataset.tasks)
        setData(filterData);
        this.renderArchive();
    }


    /**
     *
     * @param e{MouseEvent}
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
            case e.target.closest('.archive-target'):
                this.viewArchiveTasks(e);
                break;
            case e.target.closest('.archive-delete'):
                this.deleteArchive(e);
                break;
            default:
                return;
        }
    }
}
