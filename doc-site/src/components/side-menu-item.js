import { Slim } from 'slim-js';
import { tag, template } from 'slim-js/decorators';
import HTML from './side-menu-item.template.hbs';

@tag('side-menu-item')
@template(HTML)
class SideMenuItem extends Slim {
  onBeforeCreated() {
    super.onBeforeCreated();
    this._checkRoute = this.checkRoute.bind(this);
    window.addEventListener('hashchange', this._checkRoute);
  }

  hasChildren(item) {
    return item && item.children ? 'true' : 'false';
  }

  onCreated() {
    this.checkRoute();
    this.subMenu = this.item && this.item.children;
  }

  checkRoute() {
    try {
      const hash = window.location.hash.split('#/')[1];
      if (hash === this.item.target) {
        this.setAttribute('selected', '');
      } else {
        this.removeAttribute('selected');
      }
    } catch (err) {
      /* ignore error */
    }
  }

  onItemChanged() {
    this.subMenu = (this.item && this.item.children) || [];
  }

  propagateSelected(item) {
    this.callAttribute('on-selected', item);
  }

  handleSelected(item) {
    this.propagateSelected(item);
  }

  triggerSelected() {
    this.propagateSelected(this.item);
    // this.dispatchEvent(new CustomEvent('menu-item-selected', {detail: this.item, bubbles: true}))
  }

  handleItemClick() {
    this.triggerSelected();
  }

  onRemoved() {
    window.removeEventListener('hashchange', this._checkRoute);
  }
}
