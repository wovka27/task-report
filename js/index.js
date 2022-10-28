import TaskReport from '../js/TaskReport.js'

document.addEventListener('DOMContentLoaded', () => new TaskReport({
    form: {
        element: document.forms[0],
        input: document.forms[0][0],
        addBtn: '#' + document.forms[0][1].id,
        clearBtn: '#' + document.forms[0][3].id,
        copyBtn: '#' + document.forms[0][2].id
    },
    taskList: {
        element: document.getElementById('task-list'),
        deleteItemBtn: 'result-task-list__item-close',
        taskValueItem: 'result-task-list__item-content',
    },
}));