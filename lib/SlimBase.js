!!(function(document) {
    'use strict'

    class SlimBaseElement extends HTMLElement {

        constructor() {
            
        }

        get template() { return null }

        get _bindings() {
            return this.__bindings
        }

        get _renderOnAttributes() {
            return []
        }

        find(selector) {
            return this.querySelector(selector)
        }

        onAttributeChanged(attribute, oldValue, newValue) {
            var event = new Event('attributeChanged')
            event.value = {
                attribute: attribute,
                oldValue: oldValue,
                newValue: newValue
            }
            this.dispatchEvent(event)

            if (this._renderOnAttributes.indexOf(attribute) >= 0) {
                this._render()
            }
        }

        onAdded() {
            this._render()
        }
        onRemoved() {}

        __initBinding(child, childAttributeName, own, name) {
            own.__bindings = own.__bindings || {}
            own.__bindings[ name ] = own.__bindings[ name ] || {
                    executors: [],
                    binding: child.getAttribute(childAttributeName),
                    current: own[ name],
                    initial: own[ name ] }
        }

        _capturePropertyBindings() {
            this.__bindingTree.innerHTML = this.template;
            for (let child of this.__bindingTree.querySelectorAll('*')) {
                if (child.attributes) for (let i = 0; i < child.attributes.length; i++) {
                    let detection = SLIM.detectAttribute(child.attributes[i])
                    if (detection.type === 'M') {
                        detection.props.forEach( (prop) => {
                            SLIM.bindProperty(this, child, child.attributes[i].nodeName, detection.prop, detection)
                        })
                    } else if (detection.type === 'P') {
                        SLIM.bindProperty(this, child, child.attributes[i].nodeName, detection.prop)
                    }
                }
            }
        }

        onCreated() {}
        beforeRender() {
            this._capturePropertyBindings()
        }
        render() {}
        afterRender() {
        }

        _render() {

            this.__bindings = this._bindings || {}

            this.beforeRender()
            this.innerHTML = ''
            while (this.__bindingTree.children.length) {
                this.appendChild(this.__bindingTree.children[0])
            }
            this.render()
            for (let child of this.childNodes) {
                if (typeof child.render === typeof function(){} ) {
                        child.render()
                }
            }
            this.afterRender()

        }

        onAppendChild() {
        }
        onInsertAdjacentElement() {
        }
        onInsertAdjacentHTML() {
        }
        onInsertBefore() {
        }
        onNormalize() {
            this._render()
        }

        //noinspection JSUnusedGlobalSymbols
        setAttbiute(attribute, value) {
            super.setAttribute(attribute, value)
            if (value !== this.getAttribute(attribute)) {
                this.dispatchEvent(new Event('change'))
            }
            if (this._renderOnAttributes && this._renderOnAttributes.indexOf(attribute) >= 0) {
                this.render()
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
            this.onNormalize(arguments)
        }

        //noinspection JSUnusedGlobalSymbols
        insertBefore() {
            super.insertBefore.apply(this, arguments)
            this.onInsertBefore(arguments)
        }

        //noinspection JSUnusedGlobalSymbols
        insertAdjacentElement() {
            super.insertAdjacentElement.apply(this, arguments)
            this.onInsertAdjacentElement(arguments)
        }

        //noinspection JSUnusedGlobalSymbols
        insertAdjacentHTML() {
            super.insertAdjacentHTML.apply(this, arguments)
            this.onInsertAdjacentHTML(arguments)
        }

        //noinspection JSUnusedGlobalSymbols
        appendChild() {
            super.appendChild.apply(this, arguments)
            this.onAppendChild(arguments)
        }

        //noinspection JSUnusedGlobalSymbols
        createdCallback() {
            this.__bindingTree = document.createElement('x')
            this.dispatchEvent(new Event('elementCreated', {bubbles:true}))
            this.onCreated()
        }

        //noinspection JSUnusedGlobalSymbols
        attachedCallback() {
            this.dispatchEvent(new Event('elementAdded', {bubbles:true}))
            this.onAdded()
        }

        //noinspection JSUnusedGlobalSymbols
        detachedCallback() {
            this.onRemoved()
            this.dispatchEvent(new Event('elementRemoved', {bubbles:true}))
        }

        //noinspection JSUnusedGlobalSymbols
        attributeChangedCallback(attribute, oldValue, newValue) {
            if (this._renderOnAttributes.indexOf(attribute) >= 0) {
                this._render()
            }
            this.onAttributeChanged(attribute, oldValue, newValue)
        }


    }

    window.SlimBaseElement = SlimBaseElement
}(document))
