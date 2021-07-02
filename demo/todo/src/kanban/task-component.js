import { Slim, Utils } from '../../../../src/index.js';
import { depInj } from './modules/depinj.js';
import USER_SERVICE from './user-service.js';
import TASK_SERVICE from './task-service.js';

/**
 * @class
 */
class TaskComponent extends depInj(Slim) {
  static inject = [TASK_SERVICE, USER_SERVICE];
  static template = /*html*/ `
  
  <span class="task-title">{{this.task.title}}</span>
  <img *if="{{this.task?.thumb}}" title="{{this.task?.assignee}}" class="avatar" .src="{{this.task.thumb}}"/>
  <span *if="{{this.task?.assignee === 'Unassigned'}}" class="avatar">N/A</span>
  <span class="task-content">
    <span class="task-desc" @dblclick="this.editDescription()">{{this.task.description ? this.task.description : 'No Description'}}</span>
  </span>
  <span class="task-controls">
    <button @click="this.assignTask()">Assign</button>
    <button @click="this.deleteTask()">🗑</button>
  </span>

  <style>
    :host {
      position: relative;
      border: 1px solid black;
      border-radius: 0.25em;
      display: grid;
      grid-template-rows: 1em 4em 1.25em;
      grid-gap: 0.25em;
      margin-bottom: 0.5em;
    }
    .avatar {
      border-radius: 50%;
      position: absolute;
      top: -8px;
      right: -8px;
      width: 36px;
      height: 36px;
      background-color: darkgray;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid white;
      font-family: monospace;
    }
    .task-content {
      padding: 0.25em;
      background-color: lightgrey;
      font-size: 12px;
      font-family: sans-serif;
      display: inline-block;
    }
    .task-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .task-title {
      font-family: sans-serif;
      background-color: darkgreen;
      color: white;
      max-height: 2em;
      display: flex;
      height: fit-content;
      font-size: 14px;
      padding: 0.25em;
      padding-right: 32px;
    }
  </style>

  `;

  constructor() {
    super();
    this.updateUser = this.updateUser.bind(this);
  }

  get taskService() {
    return this.dependencies[TASK_SERVICE];
  }

  get userService() {
    return this.dependencies[USER_SERVICE];
  }

  get task() {
    return this._task;
  }

  set task(v) {
    this._task = v;
  }

  onCreated() {
    this.updateUser();
  }

  editDescription() {
    const newDescription = prompt(
      'Description',
      this.task.description || 'No Description'
    );
    if (newDescription !== null) {
      this.task.description = newDescription;
      this.task = this.task;
    }
    // Utils.forceUpdate(this, 'task');
  }

  deleteTask() {
    if (confirm(`Delete task ${this.task.title}?`)) {
      this.taskService.deleteTask(this.task.id);
    }
  }

  async updateUser() {
    if (this.task && this.task.assignee !== 'Unassigned') {
      this.task.thumb = (
        await this.userService.getById(this.task.assignee)
      ).picture.thumbnail;
      this.task = this.task;
    } else {
      if (this.task) {
        this.task.thumb = '';
      }
    }
  }

  assignTask() {
    this.task.assignee = prompt('Assign task to', 'eavichay');
    this.updateUser();
  }
}

customElements.define('task-component', TaskComponent);
