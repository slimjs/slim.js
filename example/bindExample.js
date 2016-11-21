(function(document) {
    "use strict";

    const template = `<input type="text" value="@{customValue}" custom="@{anotherValue}"></input>`

    document.registerElement('example-bind', class extends SlimBaseElement {

        constructor() {
            super()

        }

        render() {
            this.innerHTML = template;
            this.customValue = "12345"
            this.anotherValue = "5678"
        }

    })

}(document))