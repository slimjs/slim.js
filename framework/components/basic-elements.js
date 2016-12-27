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