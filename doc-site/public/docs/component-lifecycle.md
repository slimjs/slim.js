# Lifecycle

The class `Slim` extends `HTMLElement` therefor has the native custom-elements API callbacks. In addition, it provides additional artificial lifecycle callbacks. In some cases, template directives (such as *if or *foreach) may postpone the rendering or creation phases. The artificial hooks will ensure your code runs on-time.

### Slim class lifecycle callbacks

- **onBeforeCreated()** Executes before the shadowDOM and bindings are created
- PHASE:CREATE Plugins are notified
- **onCreated()** The template is ready and all directives were executed. The component's HTML content is still empty at this point.
- PHASE:RENDER Plugins are notified
- **onRender()** The componet has rendered for the first time

### Additional lifecycle callbacks

- **onAdded()** The component is added to the DOM. Invoked from Slim.connectedCallback
- PHASE:ADDED Plugins are notified
- **onRemoved()** The component was removed from the documenbt. Invoked from Slim.disconnectedCallback
- PHASE:REMOVED Plugins are notified

## Example

```javascript
@tag('my-element')
@template(
  `<span>{{this.myValue}}</span><input #ref="myButton" disabled type="button" click="addOne" />`
)
class MyElement extends Slim {
  onBeforeCreated() {
    // ensures that myValue is not undefined, just before the bindings are executed
    this.myValue = 1;
  }

  onCreated() {
    // element created and bound to parent custom elements, the content is still not attached
    this.loadSomeData().then((data) => doSomethingUseful(data));
  }

  onRender() {
    // access to children is available
    this.myButton.disabled = false;
  }

  onAdded() {
    console.log('Added');
  }

  onRemoved() {
    console.log('Removed');
  }
}
```

# Forced Update

Component updates are based on the property changes. When deeply nested values change, you may want to execute the bindings to ensure the change is reflected in the display. You can trigger a forced-update for all properties, or a subset of them.

Example

```javascript
import { Utils } from 'slim-js';

class MyComponent extends Slim {
  someMethod() {
    this.service.loadData().then((data) => {
      this.data.someNestedProperty = data.value; // non immmutable approach, needs forced update
      this.otherData.someNestedProperty = data.value;
      Utils.forceUpdate(this, 'data', 'otherData'); // no need to flush all properties, just this one
    });
  }

  someOtherMethod() {
    // Some useful code that affects many properties
    Utils.forceUpdate(this); // run all bindings. Will re-render only changed nodes.
  }
}
```
