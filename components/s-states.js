!!(function(document) {

    const template = `<div currentState=""></div>`

    Slim('s-states', class extends SlimBaseElement {

        get updateOnAttributes() {
            return ['current-state']
        }

        get currentState() {
            return this.getAttribute('current-state');
        }

        set currentState(value) {
            if (value !== this.currentState) {
                this.setAttribute('current-state')
            }
        }

        beforeRender() {
            this.virtual = document.createDocumentFragment()
            this.actual = this.__bindingTree
            this.currentState = this.getAttribute('current-state') || ''
        }

        render() {
            this.update()
        }

        update() {
            for (let i = this.actual.children.length; i > 0; i--) {
                let child = this.actual.children[i - 1];
                if (child.getAttribute('in-state') !== this.currentState) {
                    this.actual.removeChild(child)
                    this.virtual.appendChild(child)
                }
            }

            for (let i = this.virtual.children.length; i > 0; i--) {
                let child = this.virtual.children[i - 1];
                if (child.getAttribute('in-state') === this.currentState) {
                    this.virtual.removeChild(child)
                    this.actual.appendChild(child)
                }
            }
        }

    })
}(document))