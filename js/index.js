import TaskReport from '../js/TaskReport.js'

document.addEventListener('DOMContentLoaded', () => new TaskReport({
    result: 'result',
    clear: 'clear',
    copy: 'copy',
    taskList: 'task-list',
}).init())