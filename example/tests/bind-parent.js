Slim.tag('bind-parent', class extends Slim {

    get template() {
        return `
<div calc="[calcMinus(myProp, urProp)]"><span minus="[calcMinus(myProp, urProp)]" bind>[[wProp]]</div>
<div slim-repeat="items" bind>[[data.label]] >>> [[data.value]]</div>
<hr/>
<bind-child slim-repeat="items" a-prop="[myProp]" b-prop="[urProp]"></bind-child>
<br/>
<hr/>
<tree-list slim-repeat="tree"></tree-list>
`
    }

    onBeforeCreated() {
        this.myProp = 0
        this.urProp = 1
        this.wProp = this.myProp + this.urProp
        this.tree = [
            "alpha", "beta", "charlie", "delta", [
                "echo", "foxtrot", "golf", "hotel", "juliet", [
                    "kilo", "lima", "mike", "november"
                ]
            ]
        ]
        this.items = [ {label: 'item1', value: 1}]
    }

    calcMinus(a, b) {
        return a - b
    }

    onCreated() {
        setTimeout( () => {
            this.myProp = Math.random()
            this.urProp = Math.random()
            let l = parseInt(Math.random() * 5)
            let tmpItems = []
            for (let a = l; a >=0 ; a--) {
                tmpItems.push( {
                    label: 'item' + a,
                    value: Math.random()
                })
            }
            this.items = tmpItems
            this.tree = this.tree
        }, 1500)
        setTimeout( () => {
            this.myProp = Math.random()
            this.urProp = Math.random()
            let l = parseInt(Math.random() * 5)
            let tmpItems = []
            for (let a = l; a >=0 ; a--) {
                tmpItems.push( {
                    label: 'item' + a,
                    value: Math.random()
                })
            }
            this.items = tmpItems
        }, 500)
    }

})