<style>
  :host(doc-router) #doc h1 {
    margin-bottom: 0;
  }
  :host(doc-router) #doc h2 {
    margin-bottom: 0;
    font-weight: 400;
  }
  .hero {
    text-align: center;
    background-color: blanchedalmond;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1em;
  }
  button {
    display: block;
    background-color: rgba(255,110,64,0.9);
    box-shadow: 0 3px 4px 0 rgb(0 0 0 / 14%), 0 3px 3px -2px rgb(0 0 0 / 20%), 0 1px 8px 0 rgb(0 0 0 / 12%);
    text-decoration: none;
    color: white;
    padding: 0.5rem;
    font-size: 120%;
    border: none;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 1em;
    padding: 1em;
  }

  .padded {
    padding: 0 1em;
  }

  @media (max-width: 850px) {
    .grid {
      grid-template-columns: 1fr;
    }
    #logo {
      width: 10em;
    }
  }

  @media (max-width: 600px) {
    #logo {
      width: 6em;
    }
  }
</style>

<div class="hero">

<img id="logo" style="display: block; margin: 0 auto;" src="/src/assets/slim3.png">

# **slim.js**

## Lightning-fast web components

Easy development of user interface using modern web standards

<button onclick="window.location.hash = '#/getting-started'">Get Started</button>

</div>

<div class="grid">
  <div class="section">

### Declarative & Expressive

**slim.js** makes interactivity creation a joy. Design any view for you application and the fast implementation of **slim.js** will take care of the reactivity. Any property change or event triggered in your app will efficiently update your DOM only when it needs to.

It is expressive as you would like it to be: anything typed inside a handlebars will execute as-is, causing efficient re-render only of the affected nodes.

Declarative markup make your code easy to read and maintain.

</div>

<div class="section">

### Light & Fast

The **slim.js** core is tiny (less than 3kB gzipped) - It scans the HTML and looks for handlebars syntax. Anything inside - is your code. It just executes it as functions in your component's scope, only when your properties changes, and only for the relevant ones.

**slim.js** comes with optional built-in directives - you choose which one are applicable for you, keeping your bundle small.

**slim.js** is fast - it creates binding on-demand and releases memory as background tasks (on all major browser) using the browser's [Background Task API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Tasks_API).

</div>

<div class="section">

### Extensible & Reusable

**slim.js** is extensible. You can add your own custom directives to the registry with a simple API, or add global plugins that execute's your code on every step of a component's lifecycle.

**slim.js** is based on [custom-elements technology](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements), therefore your user interface can be used anywhere and does not interfere with any other library or framework.

**slim.js** enables you to write core components, complex poirtions of your user interface and entire web apps - You pick your size and **slim.js** will deliver.

</div>
</div>

<div class="padded">

---

### Expressive and easy

#### Typescript/Javascript with decorators

```typescript
import { Slim } from 'slim-js';
```

#### Javascript

```javascript
import { Slim } from 'slim-js';

class MyCounter extends Slim {
  count = 0;
}

Slim.element(
  'my-counter',
  '<button @click="this.count++">Click me: {{this.count}}</button>',
  MyCounter
);
```

<my-counter></my-counter>

</div>
