(function(document) {

    const template = `<div currentState=""></div>`

    document.registerElement('s-view-stack', class extends SlimBaseElement {

        get currentState() {
            return this._currentState;
        }

        set currentState(value) {
            if (value !== this.currentState) {
                this._currentState = value;
            }
        }

        constructor() {
            super()
            this.currentState = ''
        }

        render() {
            for (let child of this.children) {
                if (child.hasAttribute('in-state')) {
                    if (child.getAttribute('in-state') === this.currentState) {
                        if (child.hasOwnProperty('show')) child.show()
                    } else {
                        if (child.hasOwnProperty('hide')) child.hide()
                    }
                }
            }
        }
        get currentState() {
            return this.getAttribute('current-state')
        }
        set currentState(value) {
            if (value !== this.currentState) {
                this.setAttribute('current-state', value)
                this._render()
            }
        }

        _onAttributeChanged(attribute) {
            if (attribute === 'current-state') {
                this._currentState = this.newValue
                this.dispatchEvent(new Event('change'))
                this._render()
            }
        }

        _onAdded() {
            this._render()
        }

        _onRemoved() {
            this._render()
        }

        _onCreated() {
            this._render();
        }
    })
}(document))