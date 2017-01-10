Slim.tag('bind-child', class extends Slim {

    get template() {
        return `<div #myDiv bind>[[data.label]] Click for value [[updateCount]] / [[renderCount]]</div>`
    }

    onBeforeCreated() {
        this.updateCount = 0;
        this.renderCount = 0;
        this.customRender = false;
    }

    update() {
        this.updateCount++
        super.update()
    }

    render(tpl) {
        this.renderCount++
        super.render(tpl)
    }

    onAfterRender() {
        this.mydiv.style.color = 'red'
        this.onclick = ()=>{
            this.customRender = !this.customRender;
            if (this.customRender) {
                this.render(`<div #mydiv prop="[[data.label]]" bind>[[data.label]] : [[data.value]] - [[updateCount]] / [[renderCount]]</div>`)
            } else {
                this.render()
            }
        }
    }

})