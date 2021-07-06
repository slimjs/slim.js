# Interactivity
All native HTMLElement events are supported via reserved attributes, omitting the "on" prefix.
A Slim element can add event listeners via template. Example
```html
<ul mouseout="handleMouseOut">
    <li click="handleClick"></li>
    <li mouseover="handleMouseOver"></li>
</ul>
```
Slim.js will automatically add event listeners on the target elements and invoke the declared method name on the bound parent,
passing the native DOM event as an argument.

Native HTML Elements respond to interactive events by default, as opposed to Slim elements.
In-order to enable interactivity with native DOM events, either use the reserved *interactive* attribute on the declared
Slim element:
```html
<my-slim-child click="handleClick"></my-slim-child>
```

Example using native event:
```javascript
// import {Slim} from 'slim-js'
import {tag, template} from 'slim-js/Decorators'

@tag('some-element')
@template('<div click="clickHandler">Click me!</div>')
class SomeElement extends Slim {
  
  clickHandler(e) {
    console.log('Click', e) // Native MouseEvent
  }
}
```

# Callback binding