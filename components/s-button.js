+(function() {
    Slim('s-button', class extends SlimBaseElement {

        get updateOnAttributes() {
            return ['onclick', 'text']
        }

        get template() {
            return `<input type="button" />`
        }

        render() {
            this.onclick = undefined
            this.find('input').onclick = (event) => {
                let methodName = this.getAttribute('onclick')
                this.parentBind[this.getAttribute('onclick')](event)
            }
            this.update()
        }

        update() {
            this.find('input').value = this.getAttribute('text')
        }


    })
}())