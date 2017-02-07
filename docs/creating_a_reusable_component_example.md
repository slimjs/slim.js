# Creating a reusable component

In this example we will create a reusable notification box with a variable icon, text and colors.
First, we create a new file notification-box.html

```html
<script>
    class NotificationBox extends Slim {
    
    }
    Slim.tag('notification-box', NotificationBox);
</script>

<style>
    notification-box {
        display: inline-flex;
        padding: 0.5em;
    }
</style>
```
Our template will look like this
```js
    get template() {
        return `
        <i class="[[myIconClass]]"></i>
        <span bind>[[myText]]</span>`;
    }
```
Using the *onBeforeUpdate* hook to set the values:
```js
    onBeforeUpdate() {
        this.myText = this.getAttribute('text');
        this.myIconClass = this.getAttribute('icon-class');
        this.style.color = this.getAttribute('text-color') || 'white';
        this.style.backgroundColor = this.getAttribute('color') || 'black';
    }
```

Now let's put some notification boxes in the containing HTML piece.

```html
<head>
    <link rel="import" href="/path/to/notification-box.html" />
</head>
<body>
    <notification-box text-color="#fafafa" color="#880000"
                      text="Notification"
                      icon-class="fa fa-bell fa-2x"></notification-box>
</body>
```