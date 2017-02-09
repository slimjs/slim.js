# Method-attribute invocation

Slim enables a component to execute a bound parent's method using attributes as a bridge.
This is doable using the built-in *callAttribute* method

## Example

```js
Slim.tag('parent-tag', class extends Slim {
    get template() {
        return `<child-tag trigger="myMethod"></child-tag>`
    }
    
    myMethod(value) {
        // invoked!
        alert(value);
    }
})

Slim.tag('child-tag', class extends Slim {
    get template() {
        return '<span>Click me</span>'
    }
    onCreated() {
        this.onclick = () => {
            this.callAttribute('trigger', 'Hello, slim.js!');
        }
    }
})
```

Call attribute supports a payload optional parameter to be dispatched into the requested method.
This enables bubbling up events or dispatching events from children to their bound parents.

## Read next: [Using slim-id for direct child access](./using_slim_id.md)