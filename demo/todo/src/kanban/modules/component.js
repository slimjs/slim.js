export class BaseComponent extends HTMLElement {
  get viewModel() {
    return this._viewModel;
  }
  set viewModel(v) {
    this._viewModel = v;
    this.render();
  }
  connectedCallback() {
    this.render();
  }
  render() {
    (this.shadowRoot || this.attachShadow({ mode: 'open' })).innerHTML = this.constructor.template(this.viewModel);
  }
}

BaseComponent.template = () => '';