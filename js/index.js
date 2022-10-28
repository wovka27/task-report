import TaskReport from '../js/TaskReport.js'

document.addEventListener('DOMContentLoaded', () => new TaskReport({
    taskList: 'task-list',
}).init())