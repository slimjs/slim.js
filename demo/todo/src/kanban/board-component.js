import { Slim } from '../../../../src/index.js';
import { depInj } from './modules/depinj.js';
import TASK_SERVICE from './task-service.js';

const tpl = /*html*/ `
<div id="menu">
  <button @click="this.createNewTask()">+ Create New</button>
</div>
<ul id="board">
  <li *repeat="{{this.taskLists}}" repeat-as="{{item.title}}" class="list">
    <list-component .list={{item}}></list-component>
  </li>
</ul>
<style>
  :host {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  #menu {
    display: flex;
    justify-content: center;
    padding: 0.25em;
  }

  #board {
    display: grid;
    flex-grow: 1;
    margin: 0;
    padding: 0 0.25em 0.25em 0.25em;
    box-sizing: border-box;
    grid-template-columns: repeat({{this.taskLists.length}}, 1fr);
    grid-gap: 0.5em;
  }
  .list {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid black;
  }
</style>
`;

Slim.element(
  'board-component',
  tpl,
  class extends depInj(Slim) {
    static inject = [TASK_SERVICE];
    constructor() {
      super();
      this.taskLists = [];
    }
    onCreated() {
      this.taskLists = this.dependencies[TASK_SERVICE].getLists();
    }

    createNewTask() {
      const title = prompt('Create new task', 'New Task');
      if (title !== null) {
        this.dependencies[TASK_SERVICE].addTask(title);
      }
    }
  },
);
