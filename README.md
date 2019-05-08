![hello, slim.js](./docs/slim2.png)

[![Build Status](https://semaphoreci.com/api/v1/eavichay/slim-js/branches/master/badge.svg)](https://semaphoreci.com/eavichay/slim-js)

[Chat on gitter](https://gitter.im/slim-js/Lobby?utm_source=share-link&utm_medium=link&utm_campaign=share-link)

# Hello, slim.js

## Declarative Web Components
![](https://user-images.githubusercontent.com/1084459/57362057-9de38200-7186-11e9-9421-bed1673ce541.png)

- [Migration instructions to version 4](#version-4-changes-and-migration)
- [Official website](http://slimjs.com)
- [Documentation](https://github.com/slimjs/slim.js/wiki)


## Slim is an ultra fast, native and elegant library for [Web Components](https://www.webcomponents.org/introduction) development

**Slim.js** is a lightning fast library for development of native Web Components and Custom Elements based on modern standards. No black magic involved, no useless dependencies.

It uses ES6+DOM native API to boosts up HTML elements with superpowers.

It is extensible: You can add your own directives (HTML-compilant) for DOM manipulation.

It is pluggable: You can add plugins that are activated during different hooks in component's lifecycle.

### Is this another framework?
Nope. It's a very thin code layer (~3k) that adds framework-like power to your custom elements, using only the browser's native capabilities &mdash; as defined by W3C standards.

Here's what you get:
- Automatic rendering using templates.
- One-way data binding, derived from templates. No need to declare which properties are what.
- It can be extended: anyone can add custom plugins or directives.
- It feels like a framework (in a good way), but without the limits of a classic framework. It works everywhere, you pick your own framework.
- It's as small as 3.4 KBytes (gzipped) and the built-in directives are OPTIONAL!
- Single file for core functionality, and you're good to go.
- No dependencies, everything is based on native browsers' API. Choose your own tools.
- (_Optional_) Decorators for ES7/Next syntax, via Babel included.
- Works with mixins from other component libraries, such as Polymer, out of the box.

## Standards-compliant
- ES6
- Web Components V1
- No transpiling or compilation required

## No Setup required. It just works.
- Add Slim.js to your project and you're good to go!

# Documentation
- [Developer's Guide](http://slimjs.com)

The official website is built with Slim.js (with source maps). Check out the source code, see it for yourself.

# Version 4+ Changes and Migration
- Package files supports ES6 native modules - i.e. `import` / `exports`.
- For no-modules approach, every file has a _filename_.nomodule.js
- Directives are in separate files, to reduce core package size. For using directives:

```js
import 'slim-js/directives/repeat.js'
import 'slim-js/directives/if.js'
import 'slim-js/directives/switch-case.js'
// Or if you need them all
import 'slim-js/directives/all.js'
```

- For the no-module approach place in your HTML:

```html
<script src="slim-js/Slim.nomodule.js"></script>
<script src="slim-js/directives/all.nomodule.js"></script>
```

or alternatively use the ES6 native modules in your browser:

```html
<script type="module" src="slim-js/Slim.js"></script>
<script type="module" src="slim-js/directives/..."></script>
```

### Contibutors are welcome.

*USE THE PLATFORM*

## Do you want to be a supported? Contact **eavichay@gmail.com**.


