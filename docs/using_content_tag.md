# Using \<content> tag

A slim element can accept a DOM tree and wrap it with it's own template.
To do so, it uses the \<content> tag inside it's template.

### Example

```js
Slim.tag('my-tag', class extends Slim {
    get template() {
        return `<h1>Title before</h1>
                <content></content>
                <p>This comes after</p>`;
    }
})
```

And use the tag in the containing html (or template):

```html
<my-tag>
    <div>Hello</div><span>World</span>
</my-tag>
```

## Data binding in a content section
Slim element treats a content section as if it is part of it's native template,
thus data binding and interactivity works as if the content is declared inside the element.

### Example

```js
Slim.tag('my-tag', class extends Slim {
    get template() {
        return `<p>before</p>
                <content></content>
                <p>after</p>`;
    }
    
    onAfterRender() {
        this.someProperty = 'slim.js!';
    }
})
```

And in the HTML (or wrapping template)

```html
<my-tag>
    <span bind>Hello, [[someProperty]]</span>
</my-tag>
```

## Read next: [Using repeaters](./using_repeaters.md)