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