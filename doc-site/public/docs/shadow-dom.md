# Shadow DOM

By default, slim components are using [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM) to render the contents, and encapsulate styles.
You can opt-out using shadow-dom for a component, by using either the `useShadow` decorator or define a static property `useShadow` with value set to `false`.

## Usage

```javascript
class MyTag extends Slim {
  static get useShadow() {
    return false
  }
}

class MyOtherTag extends Slim {}
MyOtherTag.useShadow = false;



import {useShadow} from 'slim-js/decorators';

@useShadow(false)
class extends Slim {};
```
