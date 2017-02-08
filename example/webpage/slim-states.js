Slim.tag('slim-states', class extends Slim {


    update() {
        let currentChildren = Array.prototype.slice.call( this.children )
        for (let i = currentChildren.length - 1; i >= 0; i--) {
            let child = currentChildren[i]
            if (child.getAttribute('state') !== this.getAttribute('current-state')) {
                this.hiddenChildren.appendChild(child)
            }
        }

        currentChildren = Array.prototype.slice.call( this.hiddenChildren.children )
        for (let i = currentChildren.length - 1; i >= 0; i--) {
            let child = currentChildren[i]
            if (child.getAttribute('state') === this.getAttribute('current-state')) {
                this.appendChild(child)
            }
        }
    }

    onBeforeCreated() {
        this.hiddenChildren = document.createElement('virtual')
    }


})