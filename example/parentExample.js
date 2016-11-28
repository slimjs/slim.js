(function() {
    "use strict";

    document.registerElement('example-parent', class extends SlimBaseElement{

        onAdded() {
            this.number1 = 1;
            this.number2 = 5;
            this._render();

            this.modalContent = document.createElement('div');
            this.modalContent.innerHTML = `<p>Hello</p>
            <button id="close-modal">Close</button><button id="do-something">Say something</button>`
        }

        reverse(what, what2) {
            return what.toString().split('').reverse().join('') + '____' + what2
        }

        render() {
            this.innerHTML = `
<example-bound my-number="@{number1}"></example-bound>
<button id="myBtn">Click me:</button>
<example-bound my-number="@{reverse(number1, number2)}"></example-bound>
<hr/>
<button id="mdl">Modal</button>
<hr/>
<s-label text="@{reverse(number2, number2)}"></s-label>
`
            this.find('#myBtn').onclick = function() {
                this.number1 = Math.random()
                this.number2 = Math.random();
            }.bind(this)

            this.find('#mdl').onclick = function() {
                let modal = createModal()
                modal.attachDOM(this.modalContent)
                modal.show()
                modal.find('#close-modal').onclick = function() {
                    modal.hide()
                }
                modal.find('#do-something').onclick = function() {
                    alert('something!');
                }
            }.bind(this)
        }
        myMethod(what) {
            return '_' + what.toString() + '___'
        }

    })

})()