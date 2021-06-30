import { Slim } from '../../../../src/index.js';
import { depInj } from './modules/depinj.js';
import SETTINGS_SERVICE from './settings-service.js';

Slim.element(
  'settings-component',

  /*html*/ `
  
  <h1>Settings</h1>

  <label>Select theme<label>
  <select .value="{{this.currentTheme}}" @change="this.updateTheme(event.target.value)">
    <option value="dark">Dark</option>
    <option value="light">Light</option>
  </select>
  `,

  class extends depInj(Slim) {
    static inject = [SETTINGS_SERVICE];

    get service() {
      return this.dependencies[SETTINGS_SERVICE];
    }

    constructor() {
      super();
      this.currentTheme = this.service.getCurrentTheme();
    }

    updateTheme(value) {
      this.currentTheme = this.service.setTheme(value);
    }
  },
);
