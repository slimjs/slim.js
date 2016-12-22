Slim.tag('event-bus-e1', class extends Slim {


    get template() {
        return `<event-bus scope="hello"/>`
    }

    onAfterRender() {
        this.find('event-bus').addEventListener('hi', (e) => {
            console.log('hi' + e.value)

            if (!this.t) this.t = setTimeout( () => {
                let ev = new Event('bye')
                ev.value = 'bye-value'
                this.find('event-bus').broadcast(ev)
                clearTimeout(this.t)
                this.t = undefined
            }, 1000)
        })
    }


})

Slim.tag('event-bus-e2', class extends Slim {

    get template() {
        return `<event-bus scope="hello"/>`
    }

    onAfterRender() {
        this.find('event-bus').addEventListener('bye', (e) => {
            console.log('bye' + e.value)
            if (!this.t) this.t = setTimeout( () => {
                let ev = new Event('hi')
                ev.value = 'hi-value'
                this.find('event-bus').broadcast(ev)
                clearTimeout(this.t)
                this.t = undefined
            }, 500)
        })
        let ev = new Event('hi')
        ev.value = 'hi-value'
        this.find('event-bus').broadcast(ev)
    }

})

Slim.tag('event-bus-e3', class extends Slim {

    get template() {
        return `<event-bus scope="here"/>`
    }

    onAfterRender() {
        this.find('event-bus').addEventListener('bye', (e) => {
            console.log('bye' + e.value)
            if (!this.t) this.t = setTimeout( () => {
                let ev = new Event('hi')
                ev.value = 'hi-value'
                this.find('event-bus').broadcast(ev)
                clearTimeout(this.t)
                this.t = undefined
            }, 500)
        })
        let ev = new Event('hi')
        ev.value = 'hi-value'
        this.find('event-bus').broadcast(ev)
    }

})