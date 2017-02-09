# Built-in Interactivity

A Slim component can react to native DOM events using the built-in [callAttribute](./method_attribute_invocation.md) functionality.
To enable it on a component, add *isInteractive* getter method that returns true.

### Example

```js
Slim.tag('my-interactive-component', class extends Slim {

    get isInteractive() { return true }
});
```

It will respond now naturally to the native DOM events such as click, dblclick, mouseover, etc. and invoke methods on the
bound parent if applicable.

```js
Slim.tag('parent-component', class extends Slim {
    get template() {
        return '<my-interactive-component click="doSomething"></my-interactive-component>';
    }
    
    doSomething(event) {
        // do something with the event
    }
})
```

You could also enforce interactivity from a parent to a non-interactive component using the reserved *interactive* attribute

```html
    <some-component interactive click="doSomething"></some-component>
```

> - Please note that the child element must be a slim element

## Enforcing interactivity to all components

```js
Slim.autoAttachInteractionEvents = true;
```

will make all components created from this point on forward to be interactive. The component perform this check in it's initialization phase.