import { Slim } from 'slim-js';
import { tag, template } from 'slim-js/decorators';
import atomCSS from '../assets/atom-css';

const { marked } = window;
const markdownBank = {};

@tag('doc-router')
@template(/*html*/ `
<div *if="{{!this.isRouteValid}}">
  <h1>Oops, this page does not exists</h1>
  <p>Try looking for something from the menu</p>
</div>
<div id="doc">
</div>
<style>
  @import url('./index.css');
  :host([page="welcome"]) {
    padding-left: 0;
    padding-right: 0;
  }
  :host {
    padding-left: 2em;
    padding-right: 2em;
    padding-bottom: 10em;
    width: 100%;
    overflow-x: auto;
  }

  :host([page="playground"]) #doc iframe {
    border: 0;
    border-radius: 4px;
    width: 100%;
  }

  :host pre {
    box-shadow: 0 2px 3px 1px rgb(0 0 0 / 20%);
    padding-left: 1em;
    background-color: #333333;
    color: lightblue;
    padding-bottom: 1rem;
    padding-top: 1rem;
    border-radius: 0.3rem;
  }

  :host h6 {
    font-size: 1rem;
    font-style: italic;
  }

  :host a, :host a:visited {
    text-decoration: none;
    color: #444444;
    background-color: #dddddd;
    border-radius: 0.2rem;
    padding: 0 0.5rem 0 0.5rem;
    font-style: italic;
  }

  :host a:hover {
    text-decoration: underline;
  }

  @media (max-width: 510px) {
    blockquote {
      margin-inline-start: 2em;
    }

    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }

  blockquote {
    position: relative;
  }

  :host div blockquote:before {
    content: ">";
    position: absolute;
    left: -1em;
    color: orange;
    line-height: 1.8em;
  }

  #doc {
    position: relative;
    min-height: 100%;
  }

  #doc h1 {
    line-height: 1em;
    margin-bottom: 0.5em;
  }

  #doc h2 {
    margin-top: 0;
  }

  #doc p {
    font-size: 1.2em;
    line-height: 1.6em;
    letter-spacing: 0.025em;
    font-family: 'Noto Serif JP';
    font-weight: 400;
  }

  :host div blockquote:after {
    content: "";
  }

  ${atomCSS}
</style>
`)
export default class DocsRouter extends Slim {
  constructor() {
    super();
    this.isRouteValid = true;
    this.isRouteInvalid = false;
    this._handleRouteChanged = this.handleRouteChanged.bind(this);
    this.currentRoute = window.location.hash.split('#/')[1];
  }

  onRender() {
    window.addEventListener('hashchange', this._handleRouteChanged);
    this.handleRouteChanged();
  }

  currentRouteChanged() {
    if (this.currentRoute === undefined) {
      return (this.currentRoute = this.defaultRoute);
    }
    const shortRoute = this.currentRoute.split('/')[0];
    window.location.hostname !== 'localhost' &&
      window.track &&
      window.track(this.currentRoute);
    const markdownURL = `/docs/${shortRoute}.md`;
    if (markdownBank[markdownURL]) {
      this.generateMarkdown(markdownBank[markdownURL]);
    } else {
      this.isLoading = true;
      fetch(markdownURL)
        .then((r) => {
          if (r.ok) {
            return r.text();
          } else throw new Error('Error loading markdown file');
        })
        .then((markdown) => {
          markdownBank[markdownURL] = markdown;
          this.generateMarkdown(markdown);
          this.isLoading = false;
        })
        .catch(() => {
          this.doc.innerHTML = '';
          this.isRouteValid = false;
          this.isRouteInvalid = true;
          this.isLoading = false;
        });
    }
  }

  get doc() {
    return this.shadowRoot.querySelector('#doc');
  }

  generateMarkdown(content) {
    const converter = marked.marked(content); // new showdown.Converter()
    this.doc.innerHTML = converter; //converter.makeHtml(content)
    Array.from(this.doc.querySelectorAll('pre')).forEach((e) => {
      hljs.highlightBlock(e);
    });
    this.isRouteValid = true;
    this.isRouteInvalid = false;
    this.scrollTop = 0;
    const e = this.doc.querySelector(`a[name="${window.location.hash}"]`);
    if (e) {
      e.scrollIntoView();
    }
  }

  onRemoved() {
    window.removeEventListener('hashchange', this._handleRouteChanged);
  }

  handleRouteChanged() {
    this.currentRoute = window.location.hash.split('#/')[1];
    this.setAttribute('page', this.currentRoute);
    this.currentRouteChanged();
  }
}
