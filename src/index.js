import Component from './component.js';
import {
  ADDED,
  CREATE,
  RENDER,
  REMOVED,
  block,
  internals,
  repeatCtx,
  requestIdleCallback,
} from './internals.js';
import { DirectiveRegistry, PluginRegistry } from './enhance.js';
import { processDOM, removeBindings, createBind } from './dom.js';
export * as Utils from './utils.js';

export { Component as Slim };
export {
  Component,
  DirectiveRegistry,
  PluginRegistry,
  processDOM,
  removeBindings,
  createBind,
};
export const Phase = {
  ADDED,
  CREATE,
  RENDER,
  REMOVED,
};

export const Internals = {
  repeatCtx,
  internals,
  block,
  requestIdleCallback,
};

/**
 * @global
 * @var Slim
 * @type {Component}
 */

// @ts-ignore
Window.prototype.Slim = Component;
