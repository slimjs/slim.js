Slim.tag('slim-tabs', class extends Slim {

    onCreated() {
        this.tabs = this.getAttribute('tabs').split(',')
    }

    update() {
        super.update()
        this.findAll('slim-tab').forEach( tab => {
            tab.onclick = (e) => {
                this.states.currentState = tab.find('span').tabName
            }
        })
    }

})

Slim.tag('slim-tab', class extends Slim {
    get template() {
        return '<span tab-name="[[data]]" bind>[[data]] </span>'
    }
})