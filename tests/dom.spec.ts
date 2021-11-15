import { Slim } from '../dist/index';
import '../src/directives/all.directives.js';
import { strictEqual } from 'assert';
import { processDOM } from '../src/dom.js';

describe('dom', () => {
  it('should update attributes correctly', () => {
    const div = document.createElement('div');
    const model = {
      myColor: 'red',
      myName: 'avichay',
    };
    const assertFollowsModel = (/** @type {any} */ div) =>
      strictEqual(
        div.innerHTML,
        `<h1 color="${model.myColor}">Hello there ${model.myName}</h1>`
      );
    div.innerHTML = /*html*/ `<h1 color="{{this.myColor}}">Hello there {{this.myName}}</h1>`;
    const { flush } = processDOM(model, div);
    flush();
    assertFollowsModel(div);
    model.myColor = 'bye';
    assertFollowsModel(div);
    model.myName = 'moishe';
    assertFollowsModel(div);
  });
  it('should update with function calls', () => {
    const stub = {
      reverse: (/** @type {string} */ str) => str.split('').reverse().join(''),
      value: {
        name: 'avichay',
      },
    };
    const div = document.createElement('div');
    div.innerHTML = /*html*/ `<div>Hello {{this.reverse(this.value.name)}}</div><span>My mame is <span>{{this.value.name}}</span></span>`;
    const { flush } = processDOM(stub, div);
    flush();
    strictEqual(
      div.innerHTML,
      `<div>Hello ${stub.reverse(
        stub.value.name
      )}</div><span>My mame is <span>${stub.value.name}</span></span>`
    );
    stub.value.name = "slim-js"
    flush();
    strictEqual(
      div.innerHTML,
      `<div>Hello ${stub.reverse(
        stub.value.name
      )}</div><span>My mame is <span>${stub.value.name}</span></span>`
    );
    // @ts-expect-error
    stub.value = undefined;
    flush();
    strictEqual(
      div.innerHTML,
      `<div>Hello </div><span>My mame is <span></span></span>`
    );
    // @ts-expect-error
    delete stub.value;
    flush();
    strictEqual(
      div.innerHTML,
      `<div>Hello </div><span>My mame is <span></span></span>`
    );
  });
});
