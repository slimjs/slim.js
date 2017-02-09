# Component reference

Slim enables accessing a child component using the reserved *slim-id* attribute.

### Example

```js
Slim.tag('parent-tag', class extends Slim {
    get template() {
        return `<child-tag slim-id="myChild" trigger="myMethod"></child-tag>`
    }
    
    onBeforeUpdate() {
        this.myChild.message = 'Click me';
    }
    
    myMethod(value) {
        // invoked!
        alert(value);
    }
})

Slim.tag('child-tag', class extends Slim {
    get template() {
        return '<span bind>[[message]]</span>'
    }
    onCreated() {
        this.onclick = () => {
            this.callAttribute('trigger', 'Hello, slim.js!');
        }
    }
})
```

> There is a shorthand for slim-id using the # character, though html native behavior allows only small caps.
> Example usage: <child-tag #my_child></child-tag>

## Read next: [Interactivity](./using_is_interactive.md)