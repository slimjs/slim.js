# Creating an element

**slim.js** provides a base class for all components. The class extends HTMLElement and is an [Autonomous Custom Element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#autonomous_custom_elements), thus supporting all native lifecycle callbacks (i.e. `connectedCallback`, `disconnectedCallback`). It also provides artifical lifecycle hooks such as `onRender` and `onCreated`.

**Slim** ⇐ HTMLElement ⇐ Element ⇐ Node ⇐ EventTarget

## Slim.element static function

There are various ways to create custom elements. If you are coding with plain Javascript, then the _static method_ _Slim::element_ can be useful. It accepts three arguments: the custom element's tag-name that will be used in the HTML markup, the template as HTML string with the Slim.js annotations, and optionally a class if you have internal state or business-logic for the component.

```javascript
// Pure component
Slim.element(
  'my-greeting',
  /*html*/ `
    <h1>Hello, {{this.who}}!</h1>
  `
);

// Class Approach

class Greeter extends Slim {
  greet(value) {
    this.myGreetingRef.who = value;
  }
}

Greeter.template = /*html*/ `
  <input
    placeholder="Who would you like to greet?"
    @input="this.greet(event.target.value)">
  <hr/>
  <my-greeting #ref="myGreetingRef" .who="{{this.whoToGreet}}">
  </my-greeting>
`;

customElements.define('welcome-app', Greeter);
```

## tag, template, and useShadow decorators

For convenience, if you prefer typescript or javascript decorators, you can assemble a component in a more fancy manner.

The built-in decorators:

- [_@tag_](#/decorators/tag) Specify HTML tag name for the component
- [_@template_](/#/decorators/template) Declare the component's internal markup
- [_@useShadow_](/#/decorators/useShadow) optionally opt-out of using shadow DOM in your component

```typescript
import { Slim } from 'slim-js';
import { tag, template, useShadow } from 'slim-js/decorators';

@tag('my-app')
@template(/*html*/ `
  <input
    placeholder="Who would you like to greet?"
    @input="this.greet(event.target.value)">
  <hr/>
  <my-greeting .who="{{this.whoToGreet}}">
  </my-greeting>
`)
@useShadow(false)
class MyApp extends Slim {
  private whoToGreet: string = 'John Doe';

  protected greet(value = ''): void {
    this.whoToGreet = value;
  }
}
```

## HTML Usage

```html
<body>
  ...
  <my-tag></my-tag>
  ...
</body>
```
