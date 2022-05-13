![hello, slim.js](./doc-site/src/assets/slim3.png)

[![Build Status](https://semaphoreci.com/api/v1/eavichay/slim-js/branches/master/badge.svg)](https://semaphoreci.com/eavichay/slim-js)

[Chat on gitter](https://gitter.im/slim-js/Lobby?utm_source=share-link&utm_medium=link&utm_campaign=share-link)

# Hello slim.js - your declarative web components library

```javascript
import { Slim } from 'slim-js';
import { tag, template } from 'slim-js/decorators';

@tag('my-awesome-element')
@template(`
<button @click="this.inc()"> + </button>
<span>{{this.count}}</span>
<button @click="this.dec()"> - </button>
`)
class extends Slim {
  count = 0;
  inc() { this.count++ }
  dec() { this.count-- }
}

```

#### [Read the documentation](http://slimjs.com)

Slim is an ultra fast, native and elegant library for [Web Components](https://www.webcomponents.org/introduction) development.

## It's fast. Very fast.

Super fast. It leverages the native browser's API to manipulate the DOM using templates, with custom directives. Imagine Vue or Angular's structured templates combined with React's ease of use &mdash; all combined, faster and lighter.

## What's the difference? Why slim.js?

It's native. No hacks, no compilers, and no external dependencies. It aims for fast performance and low CPU usage by utilizing native `HTMLElement` class inheritance and `CustomElementRegistry`.

It works anywhere. You can combine slim.js into any other framework, combine any framework into a slim.js app, or any other combination.

You can write fully functional classes with complex code, or create pure "render-only" components without writing a single function.

Opt-in/opt-out of anything. The core is super small _(2927 bytes gzipped)_, every directive is a self-contained module. Opt-in if you like. Pick your preferences for using (or not using) shadow-DOM. Work directly with properties on the element or create a view-model layer.

It's super easy to learn. Anything in your template that is wrapped with bars (example: `<div>{{ this.user.name }}</div>` ) is the actual code that runs. And it runs only when the used properties change. Changes affect only the specific DOM nodes that are bound. This means you can manipulate the DOM manually without bothering the core, and vice-versa. It uses no virtual DOM engine or anything similar.

## What about bundling, TypeScript, or other tools?

It just works. The library is written in JavaScript, and it has `index.d.ts` to support strongly-typed projects. It also provides access to its internals, if you want to hack things out.

## What are "directives" anyway?

Directives are middleware that execute code on your template whenever you have attributes in your markup. For example, if you opt-in for the **property-directive**, any attribute that starts with a period (i.e. `<some-element .user="{{this.user}}"></some-element>`) will trigger the property-directive into action: `this.user` will project as a `user` property into `some-element`. Another example is the **foreach-directive**: You can map arrays or iterables to repeating elements. For example:

```html
<ul>
  <li *foreach="{{this.users.slice(0, 50)}}">
    <img src="{{item.picture}}" />
    <span class="user-name">{{item.name}}</span>
  </li>
</ul>
```

slim.js provides the following out-of-the-box directives:

- custom-code (default)`<form disabled="{{this.isFormReady(this.data)}}">...</form>` or `<div style="{{this.getStyleFor(this.user)}}">Welcome, {{this.user.name}}!</div>`
- property `<img .src="{{this.imageSource}}">`
- events `<input @change="this.handleInputChange(event)">`
- if `<div *if="{{!this.isLoaded}}" class="spinner">Loading...</div>`
- foreach `<li *foreach="{{this.someArray}}">{{item.value}}</li>`
- reference `<form #ref="myForm">...</form>` will create a property targeting the DOM element
- repeat (optional, faster, with lazy memory release) `<li *repeat>`

All the directives (excluding custom-code) are **optional** - each is a standalone module. Choose the directives you need, or write your own!

## What about plugins?

You can hook into any slim.js component's lifecycle using plugins. Your plugin will be notified each step of the lifecycle, so you can add your own custom code or change things on-the-go.

## Isn't a runtime library slower than compiled libraries?

Well, slim.js is an exception. Your custom code is memoized, and every piece of in-template code is created only once, and can even be shared accross components. The core is very small and efficient, and releasing bound nodes is done progressively as background-tasks, keeping the user interface responsive as first priority. The removed elements will be released slowly and progressively on modern browsers that support `requestIdleCallback`.

# Is this another framework?

Yes, and no. It's a very thin, fast, and extensible core library for writing custom-elements, powered by optional plugins and directives. You have the power to decide. It adds the firepower of a framework to your web-components, using the browser's native capabilities &mdash; as defined by W3C standards.

# Here's what you get:

- HTML markup with custom inlined code.
- Reactive components: If a property is in the template, it becomes reactive. The core wraps it with a getter and setter function (and keeping your original one intact, if exists). No need to declare &mdash; it's derived from the template.
- Data binding: data changes trigger changes in the rendered HTML.
- Directive system: Register your own directives.
- Plugins: Add global lifecycle hooks for every slim.js component.
- It feels like a framework (in a good way), but without the limits of a classic framework. It works everywhere, you can pick your own framework.
- Low-footprint: it's less than 3KB gzipped. Directives are optional.
- Single file for core functionality, and you're good to go.
- No dependencies, everything is based on native browsers' API. Choose your own tools.
- (_Optional_) Decorators for ES7/Next syntax, via Babel included.
- Works with mixins from other component libraries, such as Polymer, out of the box.

## Standards-compliant

- ES6
- Web Components V1
- No transpiling or compilation required

## No Setup required. It just works.

Use native (or bundlers) import statements, load from the CDN, or use the non-module (commonJS) file.

# Documentation

- [Developer's Guide](http://slimjs.com)

The official website is built with Slim.js (with source maps). Check out the source code, see it for yourself.

# Migration from older versions

Version 3 introduced plugins.

Version 4 introduced ES modules.

Version 5 has a new engine, directive system and plugin system.

## ES modules

```js
import { Slim } from 'slim-js';
```

## IIFE (no-modules)

```html
<script src="slim-js/dist/index.legacy.js"></script>
```

Access a global `Slim` object.

## HTML + Modules

```html
<script type="module" src="slim-js/dist/index.js"></script>
```

### Contibutors are welcome.

_USE THE PLATFORM_

## Would you like to spend some good money on a good library and support the project? Contact **eavichay@gmail.com**.
