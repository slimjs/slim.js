# Custom directives
Slim.js supports adding custom "directives" (or keyword attributes) to extend it's capabilities. These directives are not restricted to Slim elements as they can affect all html elements, native, Slim, or provided by other libraries. The only restriction is that the target elements should be nested inside a Slim element's display tree.

# Slim::customDirective (matcherFn, executableFn)
The matcher function should detect whether an attribute fulfills the requirements of the directive. The matcherFn receives the attribute as a reference.
The executableFn is a function that receives four arguments:
- source (the element which holds the template)
- target (the element which holds the custom "directive" attribute)
- attribute (the attribute during the execution time)
- match (the result from matcherFn)

> All the built-in "directives" (s:repeat, s:if, bind:X, etc.) are built using the Slim::directive API.

## Example
In the following example the directive is used to detect ENTER keypress on an element and react to it.

```javascript
// usage: <my-element key.enter="doSomething"></my-element>
Slim.customDirective(
    function matcherFn(attribute) {
        return attribute.nodeName === 'key.enter';
    },
    function enterKeyResponder(source, target, attribute, match) {
        // match in this case is `true`
        const targetFunctionName = attribute.value;
        target.addEventListener('keydown', function(event) {
            if (event.which === 13) { // ENTER key code
                if (typeof source[targetFunctionName] === 'function') {
                    // calling the delegated function
                    source[targetFunctionName](target)
                }
            }
        })
    }
)
```
In this way, the developer managed to create an extension to slim that is reusable for all elements, native or custom.
