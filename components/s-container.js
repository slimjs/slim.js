+(function() {

    Slim('s-container', class extends SlimBaseElement {

        onAttributeChanged(attribute, oldVal, newVal) {
            switch (attribute) {
                case 'layout':
                    if (newVal.toLowerCase() === 'horizontal') {
                        this.style.flexDirection = 'row'
                    } else {
                        this.style.flexDirection = 'column'
                    }
            }
        }

        beforeRender() {
            this.style.display = 'flex';
            this.style.flexDirection = 'column'
            if (!this.getAttribute('layout')) {
                this.setAttribute('layout', 'vertical')
            } else {
                this.setAttribute('layout', this.getAttribute('layout'))
            }
        }


    })

})()