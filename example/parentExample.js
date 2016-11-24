(function() {
    "use strict";

    document.registerElement('example-parent', class extends SlimBaseElement{

        _onCreated() {
            this.myProp = 1
            this._render()
        }

        render() {
            this.innerHTML = `<example-bound my-number="@{myProp}"></example-bound><button id="myBtn">Click me</button>`
            this.find('#myBtn').onclick = function() {
                this.myProp = Math.random()
                console.log(this.myProp)
            }.bind(this)
        }
        myMethod(what) {
            return '_' + what.toString() + '___'
        }

    })

})()