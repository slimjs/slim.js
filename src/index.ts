import oC from './component.js';
import { Utils as oU } from './utils.js';
import { Directives as oD } from './directive.js';
import { Plugins as oP } from './plugins.js';
import { Internals as oI } from './internals.js';
import * as oDOM from './template.js';

export namespace Slim {
  export const Component = oC;
  export const Utils = oU;
  export const Directives = oD;
  export const Plugins = oP;
  export const Internals = oI;
  export const DOM = oDOM;
  export const directives = oD.Registry;
  export const plugins = oP.Registry;
  export function element(tag: string, template: string, base = oC) {
    Object.defineProperty(base, 'template', {
      value: template,
    });
    customElements.define(tag, base);
  }
}

declare global {
  export interface Window {
    Slim: typeof Slim;
  }
}

Window.prototype.Slim = Slim;

// import Component from './component.js';
// export { Registry } from './directive.js';
// import { processDOM, removeBindings, createBind } from './template.js';
// import {
//   camelToDash,
//   dashToCamel,
//   syntaxMethod,
//   createFunction,
//   memoize,
//   lazyQueue,
//   NOOP,
// } from './utils.js';
// import { debug, repeatCtx, creationBlock, internals } from './internals.js';

// /**
//  *
//  * @param {string} tag
//  * @param {string} template
//  * @param {CustomElementConstructor} [base]
//  */
// function element(tag, template, base = class extends Slim {}) {
//   Object.defineProperty(base, 'template', {
//     value: template,
//   });
//   customElements.define(tag, base);
// }

// const Utils = {
//   camelToDash,
//   createFunction,
//   lazyQueue,
//   NOOP,
//   dashToCamel,
//   syntaxMethod,
//   debug: () => (Slim[debug] = true),
//   memoize,
//   processDOM,
//   removeBindings,
//   createBind,
//   symbols: {
//     debug,
//     repeatCtx,
//     creationBlock,
//     internals,
//   },
// };

// Slim.Utils = Utils;
// // @ts-ignore
// window.Slim = Slim;

// export const addDirectives = () =>
//   Promise.all([
//     // @ts-ignore
//     import('./repeat.directive.js').then((m) => m.default()),
//     // @ts-ignore
//     import('./if.directive.js').then((m) => m.default()),
//   ]);

// export { Component as Slim, Utils, element, Component };
