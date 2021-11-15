import { Slim } from '../dist/index';
import '../src/directives/property.directive.js';
import { strictEqual } from 'assert';
import { processDOM } from '../src/dom.js';
import assert from 'assert';


class MyAwesomeComponent extends Slim {
  myName: string

  constructor() {
    super();
    this.myName = "My Default name";
  }
}

describe('directives', () => {
  it('should update properties correctly', () => {
    const template = `<h1>Welcome, {{this.name}}!</h1>`;

    Slim.element('my-awesome-component', template, MyAwesomeComponent);

    const div = document.createElement('div');
    div.innerHTML = `<my-awesome-component .my-name="{{this.myName}}"></my-awesome-component>`;

    const model = {
      myName: "SlimJS"
    }

    const { flush } = processDOM(model, div.firstChild);
    flush();

    // The model myName property should be set on the div element here
    assert.strictEqual(div.firstChild.myName, model.myName);
  });
});
