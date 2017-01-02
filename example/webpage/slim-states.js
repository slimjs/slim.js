Slim.tag('slim-states', class extends Slim {


    get currentState() {
        return this.getAttribute('current-state')
    }

    set currentState(value) {
        this.setAttribute('current-state', value)
        this.renderChildren()
    }

    renderChildren() {
        let currentChildren = Array.prototype.slice.call( this.children )
        for (let i = currentChildren.length - 1; i >= 0; i--) {
            let child = currentChildren[i]
            if (child.getAttribute('state') !== this.currentState) {
                this.hiddenChildren.appendChild(child)
            }
        }

        currentChildren = Array.prototype.slice.call( this.hiddenChildren.children )
        for (let i = currentChildren.length - 1; i >= 0; i--) {
            let child = currentChildren[i]
            if (child.getAttribute('state') === this.currentState) {
                this.appendChild(child)
            }
        }
    }

    onBeforeCreated() {
        this.hiddenChildren = document.createElement('virtual')
    }

    onAfterRender() {
        this.renderChildren()
    }


})