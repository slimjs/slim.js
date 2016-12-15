Slim.tag('bind-child', class extends Slim {

    get template() {
        return `<div bind>Click for value</div>`
    }

    onBeforeCreated() {
        this.customRender = false;
    }

    onAfterRender() {
        this.onclick = ()=>{
            this.customRender = !this.customRender;
            if (this.customRender) {
                this.render(`<div bind>[[data.label]] : [[data.value]]</div>`)
            } else {
                this.render()
            }
        }
    }

})