(function(document) {
    "use strict";

    document.registerElement('example-bound', class extends SlimBaseElement {


        _onAttributeChanged(attribute, oldValue, newValue) {
            if (attribute === 'my-number') {
                this.myNumber = newValue
                this.render()
            }
            super._onAttributeChanged(attribute, oldValue, newValue)
        }

        render() {
            this.innerHTML = `<p>My lucky number is ${this.getAttribute('my-number')}</p>`
        }

    })

}(document))