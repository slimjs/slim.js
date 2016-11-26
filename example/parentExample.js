(function() {
    "use strict";

    document.registerElement('example-parent', class extends SlimBaseElement{

        _onAdded() {
            this.number1 = 1;
            this.number2 = 5;
            this._render();
        }

        reverse(what, what2) {
            return what.toString().split('').reverse().join('') + '____' + what2
        }

        render() {
            this.innerHTML = `
<example-bound my-number="@{number1}"></example-bound>
<button id="myBtn">Click me:</button>
<example-bound my-number="@{reverse(number1, number2)}"></example-bound>`
            this.find('#myBtn').onclick = function() {
                this.number1 = Math.random()
            }.bind(this)
        }
        myMethod(what) {
            return '_' + what.toString() + '___'
        }

    })

})()