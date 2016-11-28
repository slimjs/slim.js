+(function() {
    "use strict";

    document.registerElement('example-repeater', class extends SlimBaseElement {

        onCreated() {
            this.items = [{
                    text: 'asdasdsa'
                },
                {
                    text: 'abcde'
                },
                {
                    text: 'efghi'
                },
                {
                    text: 'jklmn'
                }]
            this.items.toString = () => {
                return '<LIST>'
            }
        }

        onAdded() {
            this._render()
        }

        render() {
            this.innerHTML = `
<s-repeat source="items">
    <s-label></s-label>
    <br />
</s-repeat>
`
        }


    })

})()