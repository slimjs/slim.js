!!(function(document) {

    document.registerElement('s-view', class extends SlimBaseElement {

        _onAdded () {
            this.content = this.innerHTML
            this.innerHTML = ''
            this.visible = false
            this.show = () => {
                if (this.visible === true) return
                this.visible = true
                this._render();
            }
            this.hide = () => {
                if (this.visible === false) return
                this.visible = false
                this._render()
            }
        }

        render() {
            if (this.visible) {
                this.innerHTML = this.content
            } else {
                this.content = this.innerHTML;
                this.innerHTML = ''
            }
        }
    })
}(document))