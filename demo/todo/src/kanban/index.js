import { Slim, Internals } from '../../../../src/index.js';

import '../../../../src/directives/all.directives.js';

import './user-service.js';
import './task-service.js';
import './settings-service.js';

import './settings-component.js';
import './app-component.js';
import './board-component.js';
import './list-component.js';
import './task-component.js';

import { on } from './model.js';

Slim[Internals.debug] = true;

on('theme', () => {
  alert('theme changed');
});
