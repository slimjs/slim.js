# Accessing children

You can access children directly using `this.querySelector` or `this.shadowRoot.querySelector` function. If you would like an easier approach, the **ref-directive** can be useful.

## Usage

```javascript
import 'slim-js/directives/ref.directive.js';

Slim.element(
  'my-component',
  '<button #ref="myButton">Click me</button>',
  class extends Slim {
    someMethod() {
      this.myButton instanceof HTMLButtonElement; // true
    }
  }
);
```

> **Note:** You cannot access children using the native querySelector functions before the rendering is complete (the onRender() callback). The ref-directives enables access to the elements just before the template is parsed to the DOM, starting from the onCreated() callback.
