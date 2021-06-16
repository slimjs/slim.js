import { Slim } from 'slim-js';
import { tag, template, useShadow } from 'slim-js/decorators';
import { createTaskList } from './task';
import { ViewModelMixin } from './viewmodel-mixin';

@tag('todo-app')
@useShadow(true)
@template(/*html*/ `
  <style>
    .done {
      text-decoration: line-through;
    }
  </style>
  <h1>Slim.JS Demo App</h1>
  <div>
    <button @click="{{this.toggleNewTodoMode()}}">Add Task</button>
    <form #ref="newTaskForm" .hidden="{{!this.newTodoMode}}" onsubmit="return false">
      <label>Add Task</label>
      <input #ref="newTaskInput" @keypress="{{this.checkEnterPress(event)}}">
    </form>
  </div>
  <todo-card *repeat="{{this.viewModel.todos}}" [task-title]="{{item.title}}" [task-id]="{{item.id}}" .task="{{item}}" [class]="{{item?.done ? 'done' : ''}}">
  </todo-card>
`)
export class App extends ViewModelMixin(Slim) {
  todos = createTaskList();
  newTodoMode = false;

  /** @type {HTMLInputElement} */ newTaskInput;
  /** @type {HTMLFormElement} */ newTaskForm;

  /**
   * 
   * @private @param {HTMLInputElement} newTaskInput 
   * @private @param {HTMLFormElement} newTaskForm 
   * @private @param {Record<string, any>} viewModel 
   */
  constructor(newTaskInput, newTaskForm, viewModel) {
    super();
    this.newTaskInput = newTaskInput;
    this.viewModel = this.viewModel || viewModel;
    this.newTaskForm = newTaskForm;
    this.todos.onChange = (info) => {
      console.log(info);
      this.viewModel.todos = [...this.todos.getTasks()];
    }
  }
  
  onCreated() {
    this.todos.add('Task 1');
    this.todos.add('Task 2');
    this.todos.add('Task 3');
  }

  toggleTodo(done, task) {
    done ? task.markComplete() : task.markInComplete();
  }

  toggleNewTodoMode() {
    this.newTodoMode = !this.newTodoMode;
  }

  checkEnterPress(event) {
    if (event.key === 'Enter') {
      const { value } = this.newTaskInput;
      this.newTaskForm.reset();
      this.toggleNewTodoMode();
      this.todos.add(value);
    }
  }
}

customElements.define('app-root', class extends HTMLBodyElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = '<todo-app></todo-app>';
  }
}, {
  extends: 'body'
});
