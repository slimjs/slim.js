# Data binding and Directives

## How reactiveness works in slim.js

**slim.js** components declare their HTML template with additional support for handlebars-like syntax and directives, via the `template` static property.

Whenever a property should affect the DOM, it is expressed anywhere inside a handlebars-like expression. For example:

```html
<header>
  <span class="user-info">
    <img class="avatar" src="{{this.userInfo.profileImage}}" />
    {{this.userInfo.username}}
  </span>
</header>
```

During the component's initialization, the template is parsed natively by the browser using the template api. The nodes tree is then being iterated: every attribute with a value wrapped in handlebars or text nodes containing handlebars syntax are being registered as bounds nodes. The property names that are being accessed in the syntax are detected by their `this.*` prefix.

In order to be efficient and avoid dirty-checking, slim.js assumes all data structures and objects are immutables.

In the example above, everytime the `userInfo` property is changed, the image's `src` attribute and the following text node will be altered. Changes inside the `userInfo` object are not being noticed, therefor component's that mutate values should either use `Utils.forceUpdate` or simply re-set the value to itself (i.e. `this.userInfo = this.userInfo`).

> ### Tip
>
> You can bind data directly into style nodes
>
> ```html
> <h1>Hello, slim.js</h1>
> <style>
>   h1 {
>     color: {{ this.myFavouriteColor }}
>   }
> </style>
> ```

## Under the hood

**slim.js** automatically creates runtime functions containing the code inside handlebars as it appears in the template. Syntax errors or runtime exceptions depends on the content of the code. Every component's property is accessed using `this.*` dot-notation syntax. The property is being wrapped with get/set accessors (keeping prior set function when applicable), triggering node(s) updates when changed. A function produced from handlebars-syntax parts is memoized: created only once, but when called, the `this` property is always the component that owns the template.

## Data binding with directives

Excluding text-node handlebars syntax support, all other bindings are optional and the proper directives should be loaded.

### Attribute bind directive

Attribute directive adds the handlebars support into attributes. The rule applies only to fully wrapped attributes. If an explicit result is `null`, `false` or `undefined`, the attribute is removed. Explicit `true` will result as an empty attribute. Otherwise, it will result as a string representation of the result.
Examples:

```html
<article
  class="{{this.someCondition ? 'someClassname' : 'someOtherClassname'}}"
></article>

<form disabled="{{this.shouldFormBeDisabled(this.someData)}}"></form>
```

### Property bind directive

When working with other custom elements, or accessing direct properties of elements, you may want to use the property directive
The directive converts dash-cased property names to camel-cased, and sets the data as calculated. Attributes starting with period are valid in HTML, but will be removed from the DOM by the attribute.

Examples:

```html
<img .src="{{this.getImageSource(this.userProfile)}}" />
<some-element .user="{{this.appData.user}}"></some-element>
```

### If directive

When a node needs to be rendered only under certain conditions, the **\*if directive** can assist.

Examples:

```html
<img *if="{{this.userInfo}}" .src="{{this.userInfo.avatar}}" />

<div *if="{{!this.isDataLoaded}}" class="spinner">Loading, please wait</div>

<div *if="{{this.isDataLoaded}}">
  <span>Loaded!</span>
</div>
```

The `<img>` element is not rendered, but kept as a template by the directive. Whenever the value of `userInfo` resolves as truthy, it will clone the template into actual elements and place in the correct place.

### Foreach directive

When there is a need to map arrays (or other iterables) to a list of elements, the **\*foreach directive** will clone elements and assign correct values. Accessing the indexed entry is used with the `item` keyword.

Example:

```html
<ul>
  <li *foreach="{{this.groceryList}}">
    {{item.amount}} - {{item.title}} - {{item.price}} USD
  </li>
</ul>
```
