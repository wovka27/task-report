import TaskReport from '../js/TaskReport.js';

const form = document.forms[0];

document.addEventListener('DOMContentLoaded', () => new TaskReport({
    form: {
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
}));
