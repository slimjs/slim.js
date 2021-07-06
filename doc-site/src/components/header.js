import { Slim } from 'slim-js';
import { tag, template } from 'slim-js/decorators';
import Logo from '../assets/slim3.png';
import GithubIcon from '../assets/github-icon.png';

@tag('slim-docs-header')
@template(/*html*/ `
<span id="logo">
    <a href="/" class=""><img src="${Logo}" width="41" height="51"/></a>
    <span>Slim.JS</span>
</span>
<nav>
    <span>latest: version 5</span>
    <span><a href="javascript:track('issue', 'https://github.com/eavichay/slim.js/issues')">Submit an issue</a></span>
    <span><a href="javascript:track('doc-issue', 'https://github.com/eavichay/slimjs-docs/issues')">Submit a documentation issue</a></span>
</nav>
<style>
@import url('./index.css');
:host {
  box-shadow: 0 2px 4px 4px rgb(0 0 0 / 25%);
  display: flex;
  justify-content: center;
  height: 4.5rem;
  background-color: #333333;
  justify-content: space-between;
  align-items: center;
  transition: 100ms ease-out;
}

:host(.small) {
  height: 3.5em;
}

:host(.small) #logo {
  width: 25px;
  height: auto;
  padding-left: 1em;
}

#logo {
  display: inline-flex;
  justify-content: flex-start;
  flex-grow: 8;
  align-items: center;
  color: white;
  padding-left: 2rem;
}

nav {
  display: inline-flex;
  flex-grow: 2;
  color: white;
  justify-content: space-around;
}

@media (max-width: 850px) {
  nav > span:not(#logo) {
    max-width: 8em;
    text-align: center;
    display: inline-flex;
    align-items: center;
  }
}


a, a:visited {
    color: white;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

#logo img {
    margin-right: 1rem;
    transition: 100ms ease-out;
}

:host(.small) #logo img {
  width: 28px;
  height: auto;
}

:host > :not(style) {
    display: inline-flex;
}
</style>
`)
class SlimDocsHeader extends Slim {}
