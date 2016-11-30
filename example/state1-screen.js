+(function() {
    "use strict";

    document.registerElement('state1-screen', class extends SlimBaseElement {


        get template() {
            return `
            <s-label text="[prop1]"></s-label>
            <div id="nesting">
                <div id="bound" prop="[prop1]"></div>
                <s-label text="[combine(prop1, prop2)]"></s-label>
                <state2-screen></state2-screen>
            </div>
            <s-label text="[prop2]"></s-label>
`
        }

        onCreated() {
            this.prop1 = 'hello'
            this.prop2 = 'world'
        }

        combine (string1, string2) {
            return `${string1}, ${string2}`
        }

        onAdded() {
            this._render()
        }




    })


})()