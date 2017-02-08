# Introduction

## What is slim.js?
Slim.js is a lightweight web component library that provides extended capabilities for components, such as data binding,
using es6 native class inheritance. This library is focused for providing the developer
the ability to write robust and native web components without the hassle of dependencies and
overhead a framework.

## Getting started
```bash
npm install slim-js --save
bower install slimjs
```
> Please note:
> Target browsers that do not support web component are required to use a polyfill like [web-components](https://www.webcomponents.org/)

# Defining a slim component
```js
Slim.tag('my-custom-tagname', class extends Slim {

});
```

Every slim.js component has it's own default template to be rendered upon placed on the DOM tree.
This template is accessible via a *template getter function*.

```js
Slim.tag('my-custom-tagname', class extends Slim {
    get template() {
        return '<div>Hello, slim.js!</div>';
    }
});
```

Usage of the element in another template or in a HTML wrapper:

```html
<body>
    <my-custom-tagname></my-custom-tagname>
</body>
```

# Data Binding
Slim.js supports one-way data binding to inner text, attributes, directly or via a parsing methods.

## Example

Text binding is used with the *bind* attribute

```js
Slim.tag('my-greeter', class extends Slim {
    get template() {
        return '<span bind>Hello, [[person]]';
    }
    
    onBeforeUpdate() {
        this.person = 'slim.js';
    }
});
```

> Slim.js creates a runtime getter/setter function for the property *greetee*, and with every change the component will
> automatically render itself with the new result.

Attribute binding is done in a same manner, only the bind attribute is not required.

```js
Slim.tag('my-custom-tag', class extends Slim {
    get template() {
        return '<my-greeter name="[[person]]"></my-greeter>'
    }
    
    onBeforeUpdate() {
        this.person = 'John doe';
    }
});
```