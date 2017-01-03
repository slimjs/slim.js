Slim.tag('slim-tabs', class extends Slim {

    onCreated() {
        this.tabs = this.getAttribute('tabs').split(',')
    }

    select(value) {
        this.states.currentState = value
    }

})

Slim.tag('slim-tab', class extends Slim {
    get template() {
        return '<span bind>[[data]] </span>'
    }

    onAfterRender() {
        this.onclick = () => {
            this.callAttribute('select', this.data)
        }
    }

    get isSlim() {
        return true
    }
})