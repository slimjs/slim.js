(function(document) {
    "use strict";

    const template = `<input type="text" value="@{customValue}"></input>`

    document.registerElement('example-bind', class extends SlimBaseElement {

        constructor() {
            super()
        }

        render() {
            this.innerHTML = template;
        }

    })

}(document))