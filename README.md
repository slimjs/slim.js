![hello, slim.js](./docs/slim2.png)

[![Build Status](https://semaphoreci.com/api/v1/eavichay/slim-js/branches/master/badge.svg)](https://semaphoreci.com/eavichay/slim-js)

[Chat on gitter](https://gitter.im/slim-js/Lobby?utm_source=share-link&utm_medium=link&utm_campaign=share-link)

# Hello, slim.js

## Migration to version 4 instructions [here](#version-4-changes-and-migration)

Official website [here](http://slimjs.com)
Documentation [here](https://github.com/slimjs/slim.js/wiki)

## Slim is ultra fast, native and elegant library for web components development
Slim.js is a lightning fast library for development of native web-components and custom-elements based modern applications. No black magic involved.
It uses es6+DOM native API and boosts up HTML elements with superpowers. 

### Is this another framework?
Nope. It's a slim code layer that adds framework-like power to your custom elements, using only the browser's native capabilities.
Here's what you get:
- Automatic rendering using templates
- One-way data binding, derived from templates
- It can be extended: Anyone can add custom plugins or directives
- It feels like a framework (in a good way), but it's not limiting you to work with any.
- It's as small as 3.4 KBytes (gzipped)!
- Single file for core functionality, and your'e good to go.
- No tools required, everything is based on native browser API. Choose your own tools.
- (Optional) Decorators for es-next syntax, via babel
- Works with mixins from other libraries, such as Polymer

# Version 4+ Changes and Migration
- Package files supports es6 native modules - i.e. import/exports.
- For no-modules approach, every file has a _filename_.nomodule.js
- Directives are in separate files, to reduce core package size. For using directives:
```js
import 'slim-js/directives/repeat.js'
import 'slim-js/directives/if.js'
import 'slim-js/directives/switch-case.js'
// Or if you need them all
import 'slim-js/directives/all.js'
```
- For the no-module approach place in your html the following
```html
<script src="slim-js/Slim.nomodule.js"></script>
<script src="slim-js/directives/all.nomodule.js"></script>

or alternatively use the es6 native modules in your browser

<script type="module" src="slim-js/Slim.js">
<script type="module" src="slim-js/directives/...">
```

## Standards compilant
- es6
- web-components V1
- no transpiling or compilation required

## Tools free
- add Slim.js to your project and your'e good to go

# Documentation
- [Developer's Guide](http://slimjs.com)

The official website is built with Slim.js (with source maps). Check out the source code, see it for yourself.

### Contibutors are welcome.

*USE THE PLATFORM*

## Wan't to sponsor the project? contact eavichay@gmail.com

[![Support slim.js](https://liberapay.com/assets/widgets/donate.svg)](https://liberapay.com/eavichay/donate)

