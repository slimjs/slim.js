class SlimResource extends Slim {


    get url() {
        return this.getAttribute('url')
    }

    get format() {
        return this.getAttribute('format') || 'text'
    }

    get interval() {
        return parseInt(this.getAttribute('interval') || 0)
    }

    attributeChangedCallback() {
        this.stopInterval()
        this.startInterval()
    }

    startInterval() {
        if (this.interval > 0) {
            this.resourceInterval = setInterval( () => {
                if (!this.isLoading) this.load()
            }, this.interval)
        }
        this.load()
    }

    stopInterval() {
        if (this.resourceInterval) {
            clearInterval(this.resourceInterval)
        }
    }

    onBeforeCreated() {
        this.isLoading = false;
    }

    onAfterRender() {
        this.stopInterval()
        this.startInterval()
    }

    get data() {
        return this._data
    }

    set data(value) {
        this._data = value
        this.callAttribute('ondata', value)
        this.isLoading = false
    }

    handleError(err) {
        let fnName = this.onerror || this.getAttribute('onerror')
        this.callAttribute('onerror', err)
        this.isLoading = false
    }

    load(options) {
        this.isLoading = true
        if (this.url) {
            fetch(this.url, options)
                .then(response => {
                    if (this.format.toLowerCase() === 'json') {
                        return response.json()
                    } else {
                        return response.text()
                    }
                })
                .then( data => {
                    this.data = data
                    return this.data
                })
                .catch( err => {
                    this.handleError(err)
                })
        }
    }

    removedCallback() {
        this.stopInterval()
    }


}

Slim.tag('s-resource', SlimResource)
