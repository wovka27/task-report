import {
    afterAnimationEnd,
    ARCHIVE_LISTS,
    date,
    DAY_WEEK,
    getChangeTask,
    getValues,
    noDuplicate,
    grabScroll,
    setEventListeners,
    setStorageTask,
    storage,
    TASK_REPORT,
    textDivider,
    useStorage,
    writeClipboard,
} from "./utils.js";
import Message from "./Message.js";
import {createDOMNode, createVNode} from "./virtual-dom.js";
import Component from "./Component.js";

export default class TaskReport extends Component {

    constructor(options = {}) {
        super();
        this.input = options.form.input;
        this.addBtn = options.form.addBtn;
        this.copyBtn = options.form.copyBtn;
        this.clearBtn = options.form.clearBtn;
        this.taskList = options.taskList.element;
        this.taskItem = options.taskList.taskItem.className;
        this.deleteItemBtn = options.taskList.taskItem.deleteItemBtn;
        this.taskValueItem = options.taskList.taskItem.taskValueItem;
        this.archive = document.querySelector(".archive-lists");

        this.message = new Message();

        const {data} = useStorage();
        this.input.value = null;
        this.renderTasksList(data);
        this.renderArchive();
        grabScroll("." + this.archive.className);
        document.body.addEventListener("click", this.clickHandler);
        document.body.addEventListener("keydown", this.keyDownHandler);
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
    copy = async (e) => {
        let self = this;
        e.preventDefault();
        const {data} = useStorage();
        if (!data || data.length === 0) {
            self.message.showMessage("Не удалось скопировать. Список пуст.");
            return;
        }
        try {
            await writeClipboard(
                `${DAY_WEEK}:\n${getValues(
                    data,
                    (item) => ` - ${textDivider(item.value)}\n`
                )}`
            );
            await self.saveTasksListToArchive(data);
            await self.renderArchive();
            self.message.showMessage("Успешно скопировано");
        } catch (e) {
            self.message.showMessage(`Не удалось скопировать, ${e}`);
        }
    };

    /**
     *
     * @param e{MouseEvent}
     */
    deleteStorageTasks = (e) => {
        e.preventDefault();
        if (this.taskListEmpty) {
            this.message.showMessage("Список пуст");
            return;
        }
        Array.from(this.taskList?.children).forEach((_, index) => {
            this.controlAnimation(index, "delete");
        });
        storage.delete(TASK_REPORT);
        afterAnimationEnd(
            (end) => end && this.renderTasksList(storage.get(TASK_REPORT))
        );
        this.message.showMessage("Очищено");
    };

    /**
     *
     * @param e{MouseEvent}
     */
    addTask = (e) => {
        if (!this.input.value || this.input.value === " ") {
            return;
        }
        e.preventDefault();
        setStorageTask(
            {id: Date.now(), value: this.input.value},
            this.renderTasksList
        );
        this.controlAnimation(this.taskList.children.length - 1, "add");
        const {data} = useStorage();
        this.saveTasksListToArchive(data);
        this.renderArchive();
        this.input.value = null;
    };

    /**
     *
     * @param e{MouseEvent}
     */
    deleteItem = (e) => {
        const {setResult, result} = getChangeTask(
            "filter",
            (item) => item.id !== +e.target.id
        );
        setResult();
        const index = Array.from(this.taskList?.children).findIndex(
            (item) => item.children[1].id === e.target.id
        );
        this.controlAnimation(index, "delete", (item) =>
            this.taskList.removeChild(item)
        );
        afterAnimationEnd((end) => end && this.renderTasksList(result));
    };

    /**
     *
     * @param e{MouseEvent}
     */
    changeItem = (e) => {
        const {tasks, result, setResult} = getChangeTask(
            "find",
            (item) => item.id === +e.target.dataset.content
        );
        e.target.contentEditable = true;
        const handler = (event) => {
            result.value = event.target.innerText;
        };
        const blur = (e) => {
            const items = noDuplicate([...tasks, result]);
            setResult(items);
            this.saveTasksListToArchive(items)
            this.renderArchive();
            this.renderTasksList(items);
            setEventListeners(e.target, [handler, keyDown, blur], true);
            e.target.contentEditable = false;

            this.message.showMessage("Изменено");
        };

        const keyDown = (e) =>
            !Boolean(e.code === "Enter" && e.shiftKey) &&
            e.code === "Enter" &&
            blur(e);
        setEventListeners(e.target, [handler, keyDown, blur]);
    };

    /**
     * Контроль за анимацией
     *
     * @param index{number}
     * @param actionAnim{string}
     * @param {(item: HTMLElement, actionAnim: string) => unknown | null} [cb]
     */
    controlAnimation = (index, actionAnim, cb) => {
        const item = this.taskList?.children[index];
        item?.classList.add(`animated-${actionAnim}`);
        afterAnimationEnd((end) => {
            if (end) {
                item?.classList.remove(`animated-${actionAnim}`);
                cb?.(item, actionAnim);
            }
        });
    };

    /**
     *
     * @param item{{value: string; id: number | string} | null}
     */
    createTask = (item) => {
        if (!item) {
            return;
        }

        const vTask = createVNode(
            "li",
            {
                class: this.taskItem,
            },
            [
                createVNode(
                    "p",
                    {
                        class: this.taskValueItem.replace(".", ""),
                        "data-content": item.id,
                        title: "Нажмите для изменения",
                        onclick: this.changeItem,
                    },
                    [item.value]
                ),
                createVNode("span", {
                    class: this.deleteItemBtn.replace(".", ""),
                    title: "Удалить",
                    id: item.id,
                    onclick: this.deleteItem,
                }),
            ]
        );

        this.taskList.appendChild(createDOMNode(vTask));
    };

    /**
     *
     * @param tasks {({id: (number|string), value: string}|Array<{id: (number|string), value: string}>)[]}
     * @param {function} [cb]
     */
    renderTasksList = (tasks, cb = () => null) => {
        this.taskList.innerHTML = "";
        tasks?.forEach((item, index) => {
            this.createTask(item);
            cb(index);
        });
    };

    /**
     *
     * @param e {KeyboardEvent | MouseEvent}
     */
    keyDownHandler = (e) => {
        if (
            !Boolean(e.code === "Enter" && e.shiftKey) &&
            e.code === "Enter" &&
            this.input.value.length !== 0
        ) {
            this.addTask(e);
        }
    };

    saveTasksListToArchive = (tasks) => {
        const {setData, data} = useStorage(ARCHIVE_LISTS);
        const todayArchive = data?.find((item) => item.today === date.today);
        if (!todayArchive) {
            setData(noDuplicate([...(data ?? []), {...date, tasks}]));
        } else {
            setData(
                noDuplicate([
                    ...(data.filter((i) => i.today !== date.today) ?? []),
                    {...date, tasks},
                ])
            );
        }
    };

    archiveItem = (item) =>
        createVNode(
            "li",
            {
                class: "archive-lists__list",
                "data-tasks": item.today,
                onclick: () => this.viewArchiveTasks(item.today),
            },
            [
                createVNode("p", {class: "archive-lists__list-date"}, [item.today]),
                createVNode("p", {class: "archive-lists__list-content"}, [
                    item.tasks[0].value === ("" || "\n") ? "..." : item.tasks[0].value,
                ]),
                createVNode("span", {
                    class: "archive-lists__list-close archive-delete",
                    onclick: (e) => this.deleteArchive(e, item.today),
                }, ['╳']),
            ]
        );

    renderArchive = () => {
        const {data} = useStorage(ARCHIVE_LISTS);

        this.archive.innerHTML = '';
        const items = () => {
            const $fragment = new DocumentFragment()
            data.forEach(item => $fragment.appendChild(createDOMNode(this.archiveItem(item))))
            return $fragment
        }
        this.archive.appendChild(items());

    };

    viewArchiveTasks = (id) => {
        const {setData} = useStorage();
        const {data} = useStorage(ARCHIVE_LISTS);

        const filterData = data.find((item) => item.today === id);
        setData(filterData.tasks);
        this.renderTasksList(filterData.tasks, (index) =>
            this.controlAnimation(index, "add")
        );
    };

    deleteArchive = (e, id) => {
        e.stopPropagation();
        const {data, setData} = useStorage(ARCHIVE_LISTS);
        const filterData = data.filter((item) => item.today !== id);
        setData(filterData);
        this.renderArchive();
    };

    /**
     *
     * @param e{MouseEvent}
     * @returns {Promise<void>}
     */
    clickHandler = async (e) => {
        switch (e.target) {
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
    };

    render = () => {

    }
}
