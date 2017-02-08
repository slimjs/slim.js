# Hello, slim.js

## Slim is an elegant library for web components

Slim.js is a lightning fast library for development of native web-components. No black magic.
It uses javascript's inheritance mechanism to boost up HTML elements with superpowers. 

### Is this another framework
No! It's a slim code layer that adds superpowers to HTML elements using it's native class inheritance.

## Custom Tags
```js
class MyComponent extends Slim {
    get template() {
        return `<h1>Hello, slim.js</h1>`
    }
}
Slim.tag('my-tag', MyComponent)
```

# Guide
[Read the guide](/guide.md)

## Binding
Slim.js creates custom getters and setters during runtime whenever it finds a bindable property.
Altering the value of the property triggers a method that re-renders the template or alters the
attribute it is bound to. Simple.

Data updates are propagated downwards from parents to children.
Events bubble up.

A *bound parent* is the parent that declares a child (nested or direct) in it's template

```js
class MyComponent extends Slim {
    get template() {
        return `<h1 class=[[myClass]]>Hello, slim</h1>`
    }
    
    onBeforeCreated() {
        this.myClass = 'big-header'
    }
}
Slim.tag('my-tag', MyComponent)
```

Attribute binding can also be processed via a function

```js
get templpate() {
    return `<h1 class=[[myMethod(myValue)]]>Hello, slim</h1>`
}

myMethod(value) {
  // do something with value
  // return something
}
```

Text bindings also possible using the *bind* attribute

```js
get template() {
    return `<h1 bind>[[title]]</h1>
}

onBeforeCreated() {
    this.title = 'Hello, slim.js!'
}
```

*bind* attribute should be used on finite children, that contains only text nodes

### Repeaters
```html
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

## Examples
- [Creating a reusable component](./creating_a_reusable_component_example.md)
- [Using content tags](./using_content_tag.md)
- [Repeaters](./using_repeaters.md)