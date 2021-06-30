import { define } from './modules/depinj.js';
import { board } from './model.js';

const SettingsService = {
  getCurrentTheme() {
    const theme = document.body.getAttribute('theme');
    return theme || 'light';
  },

  setTheme(value) {
    document.body.setAttribute('theme', value);
    board.theme = value;
    return value;
  },
};

const serviceName = 'SettingsService';

define(serviceName, () => SettingsService);

export default serviceName;
