# Getting started with slim.js

**slim.js** is a lightweight, fast, responsive, and declarative web component authoring library.

## Installation

```bash
npm install slim-js
# or
yarn add slim-js
```

## Usage

```javascript
import { Slim } from 'slim-js';

const myHTML = `<h1>Welcome, {{this.username}}!</h1>`;

class AwesomeComponent extends Slim {
  constructor() {
    super();
    this.username = 'John Jimmy Junior';
  }
}

Slim.element('my-awesome-component', myHTML, AwesomeComponent);
```

Alternativley, use from CDN

- IIFE / Global `<script src="https://unpkg.com/slim-js"></script>`
- Module `<script src="https://unpkg.com/slim-js?module"></script>`

> #### **Web-Components Spec. & Polyfills**
>
> **slim.js** is based on the browser's native DOM API's web-components spec. If you wish to support legacy browsers, you might want to add a polyfill. Add the following tag to your main HTML file:
> `html <script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/1.0.17/webcomponents-lite.js"></script>`

# Slim templates

Every slim.js component needs to define it's template. As a rule of thumb, everything wrapped in handlebars (as long as the markup is valid) is transformed into code exeucted in the scope of the component. Slim detects every handlebars-wrapped code, looks up everything that matches `this.*` and wraps the property name with getter and setter. Whenever the property is changed, the targeted node (text node or attribute) is altered accordingly. Some directives can still execute code, but do not require detection for property changes, and works without the need for handlebars syntax.
