Slim.tag('bind-child', class extends Slim {

    get template() {
        return `<div bind>this is [[aProp]] and this is [[bProp]]</div>`
    }


})