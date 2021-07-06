# Writing plugins
Slim.js provides an aspect-oriented approach for extending the behavior of an application. Plugins are executed as global lifecycle hooks.
A developer can write a plugin to catch all elements in a specific lifecycle state and add custom behavior.
For example, a developer wishes to create a simple dependency injection mechanism for specific components. She choses to inject the dependency during the creation cycle.
```javascript
// es6
import myDataModel from 'my-data-model'

Slim.plugin('create', element => {
    if (element.localName === 'my-component') {
        element.model = myDataModel
    }
})
```
In this example, every time a Slim components is at it's creation phase, it will now have access to `myDataModel` as a property.
## Available hooks
- create
- added
- beforeRender
- afterRender
- removed