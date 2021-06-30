import { Slim } from 'slim-js';
import { attribute, tag, template, useShadow } from 'slim-js/decorators';
import { createTaskList } from './task';
import { ViewModelMixin } from './viewmodel-mixin';

@tag('todo-card')
@useShadow(true)
@template(/*html*/ `
  <style>
    :host(.done) {
      #title {
        text-decoration: line-through;
      }
    }
  </style>
  <div>
    <h2 id="title">{{this.taskId}} {{this.taskTitle}}</h2>
    <h3>{{this.task.title}}</h3>
  </div>
`)
export class TodoCard extends ViewModelMixin(Slim) {
  todos = createTaskList();
  newTodoMode = false;

  // @attribute()
  taskTitle = '';

  // @attribute()
  taskId = 0;

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
    };
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
