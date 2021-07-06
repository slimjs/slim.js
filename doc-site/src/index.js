import { Slim } from 'slim-js';
import './components/app';
import './components/header';
import './components/side-menu';
import './components/simple-router';

class MyCounter extends Slim {
  count = 0;
}

Slim.element(
  'my-counter',
  /*html*/ `
<button @click="() => this.count++">
  Click me: {{this.count}}
</button>
<style>
  :host {
    display: flex;
    width: 100%;
    justify-content: center;
  }
  button {
    display: block;
    background-color: rgb(61 87 142);
    box-shadow: 0 3px 4px 0 rgb(0 0 0 / 14%), 0 3px 3px -2px rgb(0 0 0 / 20%), 0 1px 8px 0 rgb(0 0 0 / 12%);
    text-decoration: none;
    color: white;
    padding: 0.75rem 1rem;
    font-size: 120%;
    border: none;
  }
</style>
`,
  MyCounter
);
