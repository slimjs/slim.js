/**
 *
 *
 * s-button
 */
Slim.tag('s-button', class extends SlimUIBase {

    get template() {
        return `<input slim-id="myControl" type="button" value=[[text]] />`
    }

    onCreated() {
        this.text = this.getAttribute('text')
    }

})


/**
 *
 *
 * s-input
 */
Slim.tag('s-input', class extends SlimUIBase {

    get template() {
        return '<s-input-model slim-id="model"></s-input-model><input slim-id="myControl" type=[[type]] placeholder=[[placeholder]] />'
    }

    getText(val) {
        return val || ''
    }

    get value() {
        if (!this.myControl) return undefined
        return this.myControl.value
    }

    onCreated() {
        this.type = this.getAttribute('type')
        this.placeholder = this.getAttribute('placeholder')
    }

})

Slim.tag('s-input-model', class extends SlimModel {
    onCreated() {
        this.view.myControl.addEventListener('keyup', () => {
            this.view.text = this.view.myControl.value
        })

    }
})





Slim.tag('s-editable-input', class extends Slim {

    get template() {
        return `<span #label bind>[[text]]</span><input #inp type="text" value=[[text]] />`
    }

    onCreated() {
        this._boundProperty = this.getAttribute('text')
        if (this._boundProperty && this._boundProperty.indexOf('@' === 0)) {
            this._boundProperty = this._boundProperty.replace('@', '')
        }
        this.text = this._boundParent[ this._boundProperty ]

        this.style.position = 'relative'
        this.inp.style.display = 'none'
        this.inp.style.position = 'absolute'
        this.inp.style.left = '0'
        this.inp.style.top = '0'
        this.inp.onblur = () => {
            this.text = this.inp.value
            this.setAttribute('text', this.inp.value)
            this.inp.style.display = 'none'
            if (this.onchange) {
                this.onchange()
            }
            if (this._boundProperty) {
                this._boundParent[ this._boundProperty ] = this.inp.value
            }
        }
        this.label.ondblclick = () => {
            this.inp.style.display = 'initial'
            this.inp.focus()
        }
    }

})