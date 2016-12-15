Slim.tag('bind-parent', class extends Slim {

    get template() {
        return `<div><bind-child a-prop=[urProp] b-prop=[myProp]></bind-child></div>
<div calc="[calcMinus(myProp, urProp)]"><span bind>[[wProp]]</div>
<div slim-repeat="items" bind>[[data.label]] >>> [[data.value]]</div>
`
    }

    onBeforeCreated() {
        this.myProp = 0
        this.urProp = 1
        this.wProp = this.myProp + this.urProp
        this.items = [
            {label: 'item 1', value: '12345'},
            {label: 'item 2', value: '67890'}
        ]
    }

    calcMinus(a, b) {
        return a - b
    }

    onCreated() {
        setInterval( () => {
            this.myProp = Math.random()
            let l = parseInt(Math.random() * 5)
            let tmpItems = []
            for (let a = l; a >=0 ; a--) {
                tmpItems.push( {
                    label: 'item' + a,
                    value: Math.random()
                })
            }
            this.items = tmpItems
        }, 1000)

        setInterval( ()=> {
            this.urProp = Math.random()
            this.wProp = this.myProp + this.urProp
        }, 250)
    }

})