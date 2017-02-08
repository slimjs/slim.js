# Repeaters
When we have to iterate a template over a data array, repeaters are for the rescue.

### Example

```js
Slim.tag('my-tag', class extends Slim {
    onBeforeCreated() {
        this.fruits = ['Apple', 'Orange', 'Banana'];
    }
    
    get template() {
        return `<ol>
                    <li slim-repeat="fruits" slim-repeat-as="fruit">
                        <span bind>[[fruit]]</span>
                    </li>
                </ol>`
    }
});
```

In case the array contains complex objects, this template should do the work

```js
get template() {
    return `<ol>
                <li slim-repeat="fruits" slim-repeat-as="fruit">
                    <span bind>[[fruit.name]], [[fruit.calories]] cal.</span>
                </li>
            </ol>`
}
```

Changes in the array will immediately enforce re-rendering of a repeater.

Read next: [Method-attribute invocation using callAttribute](./method_attribute_invocation.md)