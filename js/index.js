import TaskReport from '../js/TaskReport.js';

const form = document.forms[0];
new TaskReport({
    form: {
        element: form,
        input: form[0],
        addBtn: '#' + form[1].id,
        clearBtn: '#' + form[3].id,
        copyBtn: '#' + form[2].id
    },
    taskList: {
        element: document.getElementById('task-list'),
        taskItem: {
            className: 'result-task-list__item',
            deleteItemBtn: '.result-task-list__item-close',
            taskValueItem: '.result-task-list__item-content',
        },
    },
});

const toggleBtn = document.getElementById('switch')

toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const self = e.currentTarget;
    const input = self.children[0]
    const body = document.body;
    const status = self.nextElementSibling;
    if (input.checked) {
        body.className = 'dark';
        status.innerText = 'Темная тема'
    } else {
        body.className = 'light';
        status.innerText = 'Светлая тема'
    }
})

const scrollArchive = () => {
    let speed = 2; // Скорость скролла.

    let scroll = document.querySelector('.archive-lists');

    let left = 0; // отпустили мышку - сохраняем положение скролла
    let drag = false;
    let coorX = 0; // нажали мышку - сохраняем координаты.

    scroll.addEventListener('mousedown', function (e) {
        drag = true;
        coorX = e.pageX - this.offsetLeft;
    });
    document.addEventListener('mouseup', function () {
        drag = false;
        left = scroll.scrollLeft;
    });
    scroll.addEventListener('mousemove', function (e) {
        if (drag) {
            this.scrollLeft = left + (e.pageX - this.offsetLeft - coorX) * speed;
        }
    });
}

scrollArchive()
