# Module::Decorators

- Module alias: 'slim-js/decorators'
- File: 'slim-js/dist/decorators.js'

## <a name="#/decorators/tag"></a>@tag

`ClassDecorator<any extends Slim> tag(string name)`

Defines a tag-name for a class extending slim.

Usage:

```javascript
import { Slim } from 'slim-js';
import { tag } from 'slim-js/decorators';

@tag('my-component')
class extends Slim {
  // code
}
```

## <a name="#/decorators/template"></a>@template

`ClassDecorator<any extends Slim> template(string html)`

Defines the HTML makrup for the Slim component by creating value for the class' static property `template`.

```javascript
import { Slim } from 'slim-js';
import { template } from 'slim-js/decorators';

@template('<h1>Hello, {{this.myName}}</h1>')
class extends Slim {
  // code
}
```

## <a name="#/decorators/useShadow"></a>@useShadow

`ClassDecorator<any extends Slim> useShadow(boolean value)`

Defines wether the component will construct using shadow-root. The decorators set value to the class' static property `useShadow`.

By default, the value of useShadow is true.

```javascript
import { Slim } from 'slim-js';
import { useShadow } from 'slim-js/decorators';

@useShadow(false)
class extends Slim {
  // code
}
```
