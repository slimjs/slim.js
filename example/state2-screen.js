+(function() {
    "use strict";

    document.registerElement('state2-screen', class extends SlimBaseElement {


        get template() {
            return `
            <s-label text="[prop1]"></s-label>
            <div id="nesting">
                <div id="bound" prop="[prop2]"></div>
                <s-label text="[combine(prop1, prop2)]"></s-label>            
            </div>
            <s-label text="[prop3]"></s-label>
`
        }

        onCreated() {
            this.prop1 = 'fuck'
            this.prop2 = 'off'
            this.prop3 = 'bitch'
        }

        combine (string1, string2) {
            return `${string1}, ${string2}`
        }

        onAdded() {
            this._render()
        }

    })

})()