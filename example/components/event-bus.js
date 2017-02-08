Slim.tag('event-bus', class EventBus extends Slim {

    onBeforeCreated() {
        EventBus.pool = EventBus.pool || {}
    }

    detachedCallback() {
        delete EventBus.pool[this.scope][this.uuid]
    }

    onCreated() {
        this.scope = this.getAttribute('scope')
        this.uuid = parseInt(Math.random() * 1000000).toString(16)
        EventBus.pool[this.scope] = EventBus.pool[this.scope] || {}
        EventBus.pool[this.scope][this.uuid] = this
    }

    broadcast(event) {
        for (var id in EventBus.pool[this.scope]) {
            EventBus.pool[this.scope][id].dispatchEvent(event)
        }
    }
})