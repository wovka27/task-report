import TaskReport from "./TaskReport.js";

const form = document.forms[0];
new TaskReport({
  form: {
    element: form,
    input: form[0],
    addBtn: form[1],
    clearBtn: "#" + form[3].id,
    copyBtn: "#" + form[2].id,
  },
  taskList: {
    element: document.getElementById("task-list"),
    taskItem: {
      className: "result-task-list__item",
      deleteItemBtn: ".result-task-list__item-close",
      taskValueItem: ".result-task-list__item-content",
    },
  },
});