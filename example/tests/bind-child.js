Slim.tag('bind-child', class extends Slim {

    get template() {
        return `<div>Click for value</div>`
    }

    onBeforeCreated() {
        this.customRender = false;
    }

    onAfterRender() {
        this.onclick = ()=>{
            this.customRender = !this.customRender;
            if (this.customRender) {
                this.render(`<div prop="[data.label]" bind>[[data.label]] : [[data.value]]</div>`)
            } else {
                this.render()
            }
        }
    }

})