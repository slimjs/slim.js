import { Slim } from 'slim-js';
import { template, tag } from 'slim-js/decorators';
import HTML from './side-menu.template.hbs';

import './side-menu-item';

// // noinspection JSUnusedGlobalSymbols
@tag('side-menu')
@template(HTML)
export default class SideMenu extends Slim {
  constructor() {
    super();
    this.selectedItem = null;
    this.addEventListener('menu-item-selected', (e) =>
      this.selectItem(e.detail)
    );
  }

  selectItem(item = {}) {
    const { target } = item;
    if (target) {
      window.location.hash = `/${item.target}`;
    }
  }
}
