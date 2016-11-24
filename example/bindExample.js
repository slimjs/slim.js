(function(document) {
    "use strict";

    const template = `<input type="text" value="@{customValue}" custom="@{anotherValue}"></input>`

    document.registerElement('example-bound', class extends SlimBaseElement {

        get _renderOnAttributes() {
            return ['my-number'];
        }

        _onAttributeChanged(attribute, oldValue, newValue) {
            if (attribute === 'my-number') {
                this.myNumber = newValue
            }
            super._onAttributeChanged(attribute, oldValue, newValue)
        }

        render() {
            this.innerHTML = `<p>My lucky number is ${this.myNumber}</p>`
        }

    })

}(document))