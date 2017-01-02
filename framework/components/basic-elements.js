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


Slim.tag('s-resource', class extends Slim {


    get url() {
        return this.getAttribute('url')
    }

    get format() {
        return this.getAttribute('format') || 'text'
    }

    get interval() {
        return parseInt(this.getAttribute('interval') || 0)
    }

    attributeChangedCallback() {
        this.stopInterval()
        this.startInterval()
    }

    startInterval() {
        if (this.interval > 0) {
            this.resourceInterval = setInterval( () => {
                if (!this.isLoading) this.load()
            }, this.interval)
        }
        this.load()
    }

    stopInterval() {
        if (this.resourceInterval) {
            clearInterval(this.resourceInterval)
        }
    }

    onBeforeCreated() {
        this.isLoading = false;
    }

    onAfterRender() {
        this.stopInterval()
        this.startInterval()
    }

    get data() {
        return this._data
    }

    set data(value) {
        this._data = value
        let fnName = this.ondata || this.getAttribute('ondata')
        if (typeof fnName === 'function') {
            fnName(value)
        } else if (typeof this._boundParent[fnName] === 'function') {
            this._boundParent[fnName](value)
        }
        this.isLoading = false
    }

    handleError(err) {
        let fnName = this.onerror || this.getAttribute('onerror')
        if (typeof fnName === 'function') {
            fnName(err)
        } else if (typeof this._boundParent[fnName] === 'function') {
            this._boundParent[fnName](err)
        }
        this.isLoading = false
    }

    load() {
        this.isLoading = true
        if (this.url) {
            fetch(this.url)
                .then(response => {
                    if (this.format.toLowerCase() === 'json') {
                        return response.json()
                    } else {
                        return response.text()
                    }
                })
                .then( data => {
                    this.data = data
                    return this.data
                })
                .catch( err => {
                    this.handleError(err)
                })
        }
    }

    removedCallback() {
        this.stopInterval()
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