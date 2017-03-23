Slim.tag('bind-child', class extends Slim {

    get template() {
        return `<div #myDiv bind click="count">[[data.label]] Click for value [[updateCount]] / [[renderCount]]</div>`
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

    count() {
        this.customRender = !this.customRender;
        if (this.customRender) {
            this.render(`<div #mydiv prop="[[data.label]]" bind click="count">[[data.label]] : [[data.value]] - [[updateCount]] / [[renderCount]]</div>`)
            this.aProp = undefined;
            const t = setTimeout( () => {
                this.count();
                clearTimeout(t);
            }, 250 );
        } else {
            this.aProp = true;
            this.render()
        }
    }

    onAfterRender() {
        this.mydiv.style.color = 'red'
    }

})