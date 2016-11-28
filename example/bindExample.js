(function(document) {
    "use strict";

    document.registerElement('example-bound', class extends SlimBaseElement {


        onAttributeChanged(attribute, oldValue, newValue) {
            if (attribute === 'my-number') {
                this.myNumber = newValue
                this.render()
            }
            super.onAttributeChanged(attribute, oldValue, newValue)
        }

        set myobject(x) {
            this._myObject = x
            this.render()
        }

        get myobject() {
            return this._myObject
        }

        render() {
            this.innerHTML = `<p>My lucky number is ${this.getAttribute('my-number')}</p>`
        }

    })

}(document))