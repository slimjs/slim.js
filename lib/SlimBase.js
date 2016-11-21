(function(document) {
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

        _onCreated() {
        }

        _onAttributeChanged(attribute, oldValue, newValue) {}

        _onAdded() {
            this._render()
        }
        _onRemoved() {}

        beforeRender() {}
        render() {}
        afterRender() {
            for (let child of this.children) {
                let attributes = child.attributes
                for (let i = 0; i < attributes.length; i++) {
                    let attributeName = attributes[i].nodeName
                    let attributeValue = attributes[i].nodeValue
                    let groups = /@{(.+)}/.exec( attributeValue )
                    if (groups) {
                        let prop = groups[1];
                        child.removeAttribute( attributeName )
                        this._bindings[prop] = function(value) {
                            child.setAttribute(attributeName, value)
                        }
                        this.__defineSetter__(prop, function(x) {
                            this.__bindings[prop](x)
                        })
                    }
                }
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
