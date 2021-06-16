/**
 * @typedef Task
 * @property {boolean} done
 * @property {number} id
 * @property {string} title
 * @property {Function} markComplete
 * @property {Function} markInComplete
 * @property {Function} onChange
 */

let id = 0;

const TaskProto = {
  get title() {
    return this._title;
  },
  get id() {
    return this._id;
  },
  set title(v) {
    if (v === this._title) return;
    this._title = v;
    this.onChange({
      type: 'title',
      task: this,
    });
  },
  markComplete() {
    this.done = true;
    this.onChange({
      type: 'complete',
      task: this,
    });
  },
  markInComplete() {
    this.done = false;
    this.onChange({
      type: 'incomplete',
      task: this,
    });
  },
  onChange(event) {},
};

/**
 * @param {string} title
 * @returns {Task}
 */
const Task = (title) => {
  return Object.assign(Object.create(TaskProto), { _title: title, _id: ++id });
};

/** @class TaskList */
class TaskList {
  /**
   * @private
   * @type {Task[]}
   */
  tasks = [];

  add(/** @type {string} */ title) {
    const task = Task(title);
    this.tasks.push(task);
    task.onChange = (info) => this.onChange(info);
    this.onChange({
      type: 'add',
      task,
    });
  }

  remove(/** @type {number} */ id) {
    const task = this.tasks.find((task) => task.id === id);
    if (task) {
      this.tasks = this.tasks.filter((t) => t.id !== id);
      this.onChange({
        type: 'remove',
        task,
      });
    }
  }

  getTasks() {
    return [...this.tasks];
  }

  onChange(event) {}
}

export const createTaskList = () => new TaskList();
