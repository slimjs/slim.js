# API

## Slim

_type_ Abstract Class

Extends **HTMLElement**<br/>
Implements **CustomElementConstructor**

`new(...args: any[]) => Slim`

usage:

```javascript
class MyCounter extends Slim {
  constructor() {
    super();
    this.count = 0;
  }
}
```

## Slim::element

_type_ Static function

Shorthand function fore creatings Slim.js based web components.

`Slim.element(tagName: string, html: string, base?: typeof Slim = Slim);`

As a shorthand utility function it executes `customElements.define` with _tagName_ and _base_ as parameters. It sets a static property named `_template_` on class `_base_` valued with the given html.

Usage:

```javascript
Slim.element(
  'my-counter',
  `
    <button @click="this.count--"> - </button>
    <span>{{this.count}}</span>
    <button @click="this.count++"> + </button>
  `,
  class MyCounter extends Slim {
    constructor() {
      super();
      this.count = 0;
    }
  }
);
```

Render-only component

```javascript
Slim.element(
  'my-banner',
  `
  <div count="{{this.count === undefined ? this.count = 0 : void 0}}">
    <button @click="() => this.count++">+</button>
    <span>{{this.count}}</span>
    <button @click="() => this.count--">-</button>
  </div>
  `
);
```
