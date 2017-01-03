/**
 *
 *
 * s-hgroup
 */
Slim.tag('s-hgroup', class extends Slim {
    get template() {
        return `<content></content>`
    }

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
Slim.tag('s-vgroup', class extends Slim {

    get template() {
        return `<content></content>`
    }

    createdCallback() {
        this.style.display = 'flex'
        this.style.flexDirection = 'column'
    }

})