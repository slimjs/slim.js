;(function(){
    Slim('s-input', class extends SlimBaseElement {

        get updateOnAttributes() {
            return ['onchange',
                    'onclick',
                    'ondblclick',
                    'onmousedown',
                    'onmouseup',
                    'onmousemove',
                    'onmouseover',
                    'onmouseout',
                    'onwheel',
                    'oncopy',
                    'onpaste',
                    'oncut',
                    'onkeydown',
                    'onkeypress',
                    'onkeyup',
                    'onblur',
                    'oninput',
                    'oninvalid',
                    'onreset',
                    'onsearch',
                    'onselect',
                    'onfocus']
        }

        get template() {
            return `<input />`
        }

        render() {
            this.onchange = this.onclick = this.onkeydown = null
            let input = this.find('input')

            this.updateOnAttributes.forEach( attr => {
                input[attr] = (event) => {
                    if (this.getAttribute(attr)) {
                        this.parentBind[this.getAttribute(attr)](event);
                    }
                }
            })
            this.update()
        }

        update() {

        }

    })
})()