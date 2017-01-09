# Hello, slim.js

MVVM infrastructure for rapid development of native web components using markup and code-behind.
Supports data-binding, repeaters, plugins.

## Custom components
Usage:
```
Slim.tag('my-tag', class extends Slim {
})
```

## Component Lifecycle
Native element's lifecycle are extended in slim to the following
creation -> initialization -> *onBeforeCreated* -> binding -> *onCreated* -> *onBeforeRender* -> first render -> *onAfterRender* -> *update*

### Data-Binding
A property can be bound to an attribute, see example:
```
<my-custom-tag child-attribute="[[parentProperty]]"></my-custom-tag>
<my-custom-tag child-attribute="[[someFunction(parentProperty)]]"></my-custom-tag>
```
slim injects a property getter/setter functions for *parentProperty* and updates automatically the child node on every update

### Content inclusion
```
Slim.tag('my-form, class extends Slim {
    get template() {
        return '<form>
        <content></content>
        <input type="submit" value="OK" /></form>
    }
})
...
<my-form><input type="text" placeholder="Enter your name" /></my-form>
```

### Interface / Lifecycle
- get template() // return your HTML
- onBeforeCreated() // before the binding happens
- onCreated() // after the generation of the tree
- onBeforeRender() // before the virtual DOM becomes real DOM
- onAfterRender() // after you have a DOM

### Methods
- render(&lt;HTML&gt; | undefined) // empty will reset to your original template
- update() // flushes update down the tree

### Attributes
##### bind
Used to apply property-to-text binding on an element

Usage:
```
<div bind>[[myProperty]]</div>
```

##### slim-id
Creates the name as a reference directly in your component

Usage:
```
<div slim-id="myContent" />
...
afterRender() {
  this.myContent.textContent = 'Hello, slim.js'
}
```

##### slim-repeat
Repeats and item from an array data source property in your element, and injects the result as "data" property in every cloned element

Usage:
```
<div slim-repeat="items" bind>[[data.title]]</div>
```
Repeaters are also available for custom elements
```
<my-custom-tag slim-repeat="items"></my-custom-tag>
```
And in your custom tag you could implement
```
get template() {
  return `<div bind>[[data.someProperty]]</div>`
}
```
Repeaters support complex display trees, as all elements in the tree accept the data and the index
```
<li slim-repeat="items">
    <div><span bind>[[data_index]]</span><my-custom-tag></my-custom-tag</div>
</li>
```
## Installation
```
npm install slim-js
bower install slim.js
```
