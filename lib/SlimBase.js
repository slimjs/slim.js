!!(function(document) {
    'use strict'

    class SlimBaseElement extends HTMLElement {

        constructor() {
        }

        get _bindings() {
            return this.__bindings
        }

        get _renderOnAttributes() {
            return []
        }

        find(selector) {
            return this.querySelector(selector)
        }

        _guid(length = 24) {
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('')
            let result = ''
            while (length--) {
                result += chars[ Math.floor( Math.random() * chars.length )]
            }
            return result
        }

        _onCreated() {
        }

        _onAttributeChanged(attribute, oldValue, newValue) {
            var event = new Event('attributeChanged')
            event.value = {
                attribute: attribute,
                oldValue: oldValue,
                newValue: newValue
            }
            this.dispatchEvent(event)

        }

        _onAdded() {
            this._render()
        }
        _onRemoved() {}

        beforeRender() {}
        render() {}
        afterRender() {
            for (let child of this.children) {
                let attributes = child.attributes
                let attributesToInitialize = []
                let uuid = this._guid()
                for (let i = 0; i < attributes.length; i++) {
                    let attributeName = attributes[i].nodeName
                    let attributeValue = attributes[i].nodeValue
                    let groups = /@{(.+)}/.exec( attributeValue )
                    if (groups) {
                        let prop = groups[1];
                        attributesToInitialize.push( {attr: attributeName, uid: uuid, prop: prop} )
                        child.setAttribute(attributeName, this[prop])
                        child.setAttribute('s-bind', uuid)
                        this._bindings[prop] = this._bindings[prop] || {
                            uid: {},
                            initial: this[prop]
                        }
                        let self = this
                        this._bindings[prop].uid[uuid] = function(uuid, prop, value) {
                            let boundChild = self.find(`[s-bind="${uuid}"]`)
                            if (!boundChild) return
                            boundChild.setAttribute(attributeName, value)
                            if (boundChild.hasOwnProperty(attributeName)) {
                                boundChild[attributeName] = value
                            }
                        },
                        this.__defineSetter__(prop, function(x) {
                            for (let uid in this._bindings[prop].uid) {
                                this._bindings[prop].uid[uid](uid, prop, x)
                            }
                        })
                    }
                }
                attributesToInitialize.forEach( (o) => {
                    this.__bindings[o.prop].uid[o.uid]( o.uid, o.prop, this.__bindings[o.prop].initial)
                })
            }
        }

        _render() {

            this.__bindings = this._bindings || {}

            this.beforeRender()
            this.render()
            this.afterRender()

        }

        _onAppendChild() {
        }
        _onInsertAdjacentElement() {
        }
        _onInsertAdjacentHTML() {
        }
        _onInsertBefore() {
        }
        _onNormalize() {
            this._render()
        }

        //noinspection JSUnusedGlobalSymbols
        setAttbiute(attribute, value) {
            super.setAttribute(attribute, value)
            if (value !== this.getAttribute(attribute)) {
                this.dispatchEvent(new Event('change'))
            }
        }

        //noinspection JSUnusedGlobalSymbols
        removeChild() {
            super.removeChild.apply(this, arguments)
            // this._onRemoveChild(arguments)
        }

        //noinspection JSUnusedGlobalSymbols
        replaceChild() {
            super.replaceChild.apply(this, arguments)
            // this._onReplaceChild(arguments)
        }

        //noinspection JSUnusedGlobalSymbols
        normalize() {
            super.normalize.apply(this, arguments)
            this._onNormalize(arguments)
        }

        //noinspection JSUnusedGlobalSymbols
        insertBefore() {
            super.insertBefore.apply(this, arguments)
            this._onInsertBefore(arguments)
        }

        //noinspection JSUnusedGlobalSymbols
        insertAdjacentElement() {
            super.insertAdjacentElement.apply(this, arguments)
            this._onInsertAdjacentElement(arguments)
        }

        //noinspection JSUnusedGlobalSymbols
        insertAdjacentHTML() {
            super.insertAdjacentHTML.apply(this, arguments)
            this._onInsertAdjacentHTML(arguments)
        }

        //noinspection JSUnusedGlobalSymbols
        appendChild() {
            super.appendChild.apply(this, arguments)
            this._onAppendChild(arguments)
        }

        //noinspection JSUnusedGlobalSymbols
        createdCallback() {
            this._onCreated()
        }

        //noinspection JSUnusedGlobalSymbols
        attachedCallback() {
            this._onAdded()
        }

        //noinspection JSUnusedGlobalSymbols
        detachedCallback() {
            this._onRemoved()
        }

        //noinspection JSUnusedGlobalSymbols
        attributeChangedCallback(attribute, oldValue, newValue) {
            if (this._renderOnAttributes.indexOf(attribute) >= 0) {
                this._render()
            }
            this._onAttributeChanged(attribute, oldValue, newValue)
        }


    }

    window.SlimBaseElement = SlimBaseElement
}(document))
