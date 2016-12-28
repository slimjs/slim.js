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
        return '<input slim-id="myControl" type=[[type]] placeholder=[[placeholder]] value=[[getText(text)]] />'
    }

    getText(val) {
        return val || ''
    }

    get value() {
        if (!this.myControl) return undefined
        return this.myControl.value
    }

    onCreated() {
        this.addEventListener('keyup', () => {
            this.text = this.find('input').value
        })
        this.type = this.getAttribute('type')
        this.placeholder = this.getAttribute('placeholder')
    }

})


/**
 *
 *
 * s-hgroup
 */
Slim.tag('s-hgroup', class extends HTMLElement {
    createdCallback() {
        this.style.display = 'flex'
        this.style.flexDirection = 'row'
    }
})


/**
 *
 *
 * s-vgroup
 */
Slim.tag('s-vgroup', class extends HTMLElement {

    createdCallback() {
        this.style.display = 'flex'
        this.style.flexDirection = 'column'
    }

})



Slim.tag('s-editable-input', class extends Slim {

    get template() {
        return `<span slim-id="label" bind>[[text]]</span><input slim-id="inp" type="text" value=[[text]] />`
    }

    onCreated() {
        this._boundProperty = this.getAttribute('text')
        if (this._boundProperty && this._boundProperty.indexOf('@' === 0)) {
            this._boundProperty = this._boundProperty.replace('@', '')
            this.text = this._boundParent[ this._boundProperty ]
        }

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