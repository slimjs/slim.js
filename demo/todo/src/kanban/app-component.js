import { Slim } from '../../../../src/index.js';
import { depInj } from './modules/depinj.js';
import { router } from './modules/router.js';
import TASK_SERVICE from './task-service.js';

class AppComponent extends depInj(Slim) {
  static inject = [TASK_SERVICE];
  static useShadow = false;
  static template = /*html*/ `
  <header>
    <h1>Naked Kanban</h1>
    <nav>
    <a @click="{{this.router.navigate('/home')}}">Board</a>
    <a @click="{{this.router.navigate('/settings')}}">Settings</a>
    </nav>
  </header>
  <main>
    <router-outlet path="*" component="board-component"></router-outlet>
    <router-outlet path="/home" component="board-component"></router-outlet>
    <router-outlet path="/settings" component="settings-component"></router-outlet>
  </main>
  <style>
    app-component {
      height: 100%;
      display: grid;
      grid-template-rows: 2em 1fr;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: black;
      color: white;
      height: 2em;
      padding: 0.5em;
    }
    h1 {
      font-size: 1.2em;
    }
    nav {
      flex-grow: 1;
      padding: 0.5em;
      display: flex;
      justify-content: flex-end;
    }
    a {
      cursor: pointer;
      margin-right: 1em;
    }
  </style>
  `;

  constructor() {
    super();
    this.router = router;
  }

  onRender() {
    this.router.init();
  }
}

customElements.define('app-component', AppComponent);
