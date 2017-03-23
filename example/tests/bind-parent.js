Slim.tag(
    'bind-parent',
    `
        <h1 bind>[[myTitle]]</h1>
        <div calc="[[calcMinus(myProp, urProp)]]"><span minus="[[calcMinus(myProp, urProp)]]" bind>[[wProp]]</div>
        <div slim-repeat="items" prop-repeat="[[data.value]]" bind>[[data.label]] >>> [[data.value]]</div>
        <hr/>
        <li slim-repeat="items"><div>Div</div><span bind>Label [[data.label]]</span></li>
        <hr/>
        <slim-content></slim-content>`,
    class extends Slim {

    testOnCancel() {
        alert('cancel')
    }

    testOnConfirm() {
        alert('ok')
    }

    testClick(e) {
        console.log(e);
    }

    onBeforeCreated() {
        this.myUndefined = undefined;
        this.myTitle = "Binding Test"
        this.myProp = 0
        this.urProp = 1
        this.wProp = this.myProp + this.urProp
        this.tree = [
            "alpha", "beta", "charlie", "delta", [
                "echo", "foxtrot", "golf", "hotel", "juliet", [
                    "kilo", "lima", "mike", "november"
                ],
                "opera"
            ]
        ]
        this.items = [ {label: 'item1', value: 1}]
    }

    calcMinus(a, b) {
        return a - b
    }

    onCreated() {
        setTimeout( () => {
            this.items = window.myCustomList
            console.log(this.items)
        }, 1500)
        setTimeout( () => {
            this.myProp = Math.random()
            this.urProp = Math.random()
            this.wProp = this.myProp + this.urProp
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
        }, 1000)
        setTimeout( () => {
            this.myProp = Math.random()
            this.urProp = Math.random()
            this.wProp = this.myProp + this.urProp
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

});