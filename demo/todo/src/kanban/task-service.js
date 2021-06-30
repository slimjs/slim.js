import { define } from './modules/depinj.js';

import { ITEM_STATUS, board, item, list, on as watch, bus } from './model.js';

const getList = (title) => {
  return board.lists.find((list) => list.title === title);
};

const TaskService = {
  getLists() {
    return [...board.lists];
  },

  findList(title) {
    return getList(title);
  },

  getTasks(list) {
    if (typeof list === 'string') {
      list = getList(list);
    }
    return [...list.items];
  },

  moveTask(taskId, fromList, toList) {
    const task = fromList.items.find((t) => t.id === taskId);
    if (task) {
      fromList.items = fromList.items.filter((t) => t !== task);
      toList.items = [...toList.items, task];
      bus.emit('TASK MOVED', {
        task,
        fromList,
        toList,
      });
    }
  },

  addTask(title) {
    const newTask = item(title);
    const list = getList('Backlog');
    list.items = [...list.items, newTask];
    bus.emit('NEW TASK', newTask);
  },

  addList(title) {
    const newList = list(title);
    board.lists = [...board.lists, newList];
    bus.emit('NEW LIST', newList);
  },

  deleteTask(taskId) {
    let inList;
    const task = board.lists.reduce((current, list) => {
      const found = list.items.find((t) => t.id === taskId);
      if (found) {
        inList = list;
        return found;
      }
      return current;
    }, undefined);
    if (inList) {
      inList.items = inList.items.filter((t) => t.id !== task.id);
      bus.emit('TASK MOVED', {
        task,
        fromList: inList,
        toList: null,
      });
    }
  },

  assignItem(task, asignee) {
    task.asignee = asignee;
    if (task.status === ITEM_STATUS.UNASSIGNED) {
      task.status = ITEM_STATUS.IN_PROGRESS;
    }
    bus.emit('TASK ASSIGNED');
  },

  on: watch,
};

const serviceName = 'TaskService';

define(serviceName, () => TaskService);

export default serviceName;
