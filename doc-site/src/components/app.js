import { Slim } from 'slim-js';
import { tag, template } from 'slim-js/decorators';
import 'slim-js/directives/all.directives.js';
import TEMPLATE from './app.template.hbs';

@tag('slim-docs')
@template(TEMPLATE)
class App extends Slim {
  menuItems = [
    { label: 'Welcome', target: 'welcome' },
    { label: 'Getting started', target: 'getting-started' },
    {
      label: 'Creating an element',
      target: 'creating-an-element',
      children: [
        { label: 'Lifecycle', target: 'component-lifecycle' },
        { label: 'Accessing children', target: 'accessing-children' },
        { label: 'Using Directives', target: 'using-directives' },
        { label: 'Shadow-DOM', target: 'shadow-dom' },
      ],
    },
    {
      label: 'API',
      target: '',
      children: [
        { label: 'Slim Class', target: 'API-Slim' },
        { label: 'Decorators', target: 'decorators' },
        { label: 'Directive', target: 'creating-directives' },
        { label: 'Plugin', target: 'plugins' },
      ],
    },
    { label: 'Playground', target: 'playground' },
  ];

  constructor() {
    super();
    this.handleScroll = this.handleScroll.bind(this);
    this.handleFrame = this.handleFrame.bind(this);
  }

  onCreated() {
    if (window.location.hash === '') {
      window.location.hash = '#/welcome';
    }
    window.addEventListener('hashchange', () => {
      this.scrollTo(0, 0);
      this.handleFrame();
    });
    this.viewbox.addEventListener('scroll', this.handleScroll);
    this.handleFrame();
  }

  disconnectedCallback() {
    this.viewbox.removeEventListener('scroll', this.handleScroll);
  }

  handleFrame() {
    if (this.viewContainer.scrollTop) {
      this.viewContainer.scrollTo(0, 0);
    }
    if (window.location.hash === '#/playground') {
      requestAnimationFrame(this.handleFrame);
    }
  }

  handleScroll() {
    if (this.viewbox.scrollTop > 50) {
      this.header.classList.add('small');
    } else {
      this.header.classList.remove('small');
    }
  }
}
