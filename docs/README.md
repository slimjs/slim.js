# Hello, slim.js

## Slim and elegant library for web components

Slim.js is a lightning fast library for development of native web-components. No black magic.
It uses javascript's inheritance mechanism to boost up HTML elements with superpowers. 

### Is this another framework
No! It's a slim code layer that adds superpowers to HTML elements using it's native class inheritance.

## Custom Tags
```
class MyComponent extends Slim {
    get template() {
        return `<h1>Hello, slim.js</h1>`
    }
}
Slim.tag('my-tag', MyComponent)
```

## Binding
Slim.js creates custom getters and setters during runtime whenever it finds a bindable property.
Altering the value of the property triggers a method that re-renders the template or alters the
attribute it is bound to. Simple.

Data updates are propagated downwards from parents to children.
Events bubble up.

A *bound parent* is the parent that declares a child (nested or direct) in it's template

```
class MyComponent extends Slim {
    get template() {
        return `<h1 class=[[myClass]] bind>[[myTitle]]</h1>`
    }
    
    onBeforeCreated() {
        this.myClass = 'big-header'
        this.myTitle = 'Hello, slim.js'
    }
}
Slim.tag('my-tag', MyComponent)
```

Attribute binding can also be processed via a function

```
get templpate() {
    return `<h1 class=[[myMethod(myValue)]]>Hello, slim</h1>`
}

myMethod(value) {
  // do something with value
  // return something
}
```

### Repeaters
```
<my-todo slim-repeat="todos" slim-repeat-as="todo">
```

This will repeatedly create several <my-tag> elements and inject to each a property named "todo" with the value from the
source array "todos" on the *bound parent* element.

Repeaters do not process attribute bindings and it is recommended to use repeaters on Slim elements in order to keep the
data flow chained correctly.

### Lifecycle
A Slim element has a rich lifecycle that can be accessed with ease:
- element declared on the DOM
- Initialization
- onBeforeCreated()*
- element creation + data binding
- onCreated()*
- onBeforeRender()*
- element renders
- render
- onAfterRender()*

\* empty methods that can be implemented when inheriting a slim element.

## Standards compilant
- es6
- no transpiling or compilation required

## Tools free
- add Slim.js to your project and your'e good to go