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
            this.onCreated()
        }

        _onAttributeChanged(attribute, oldValue, newValue) {
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

        _onAdded() {
            this._render()
        }
        _onRemoved() {}

        __initBinding(child, childAttributeName, own, name) {
            own.__bindings = own.__bindings || {}
            own.__bindings[ name ] = own.__bindings[ name ] || {
                    executors: [],
                    binding: child.getAttribute(childAttributeName),
                    current: own[ name],
                    initial: own[ name ] }
        }

        bindMethod(child, childAttributeName, own, ownMethodName, props) {
            this.__initBinding(child, childAttributeName, own, ownMethodName);
            var executor = () => {
                if (child && own && child.parentNode === own) {
                    var result = own[ownMethodName].apply(own, props.map( (prop) => { return own[prop] } ))
                    child.setAttribute(childAttributeName, result)
                }
            }
            this.bindProperty(child, childAttributeName, own, ownMethodName, executor)
        }

        bindProperty(child, childAttributeName, own, ownPropertyName, customMethod = undefined) {
            this.__initBinding(child, childAttributeName, own, ownPropertyName)
            var executor = customMethod ? customMethod : function() {
                if (child && own && child.parentNode === own)
                child.setAttribute(childAttributeName, own.__bindings[ownPropertyName].current)
            }
            own.__bindings[ ownPropertyName ].executors.push(executor);
            executor.child = child;
            own.__defineSetter__(ownPropertyName, (x) => {
                own.__bindings[ownPropertyName].current = x
                this._executeBindings.call(own)
            })
            own.__defineGetter__(ownPropertyName, () => {
                return own.__bindings[ownPropertyName].current;
            })
        }

        _executeBindings() {
            for (var prop in this.__bindings) {
                this.__bindings[prop].executors.forEach( (fn) => { fn() })
            }
        }

        _capturePropertyBindings() {
            for (let child of this.children) {
                for (let i = 0; i < child.attributes.length; i++) {
                    let methodMatch = /@{(.+)(\((.+)\)){1}}/.exec( child.attributes[i].nodeValue )
                    let propertyMatch = /@{(.+)(\(\)){0}}/.exec( child.attributes[i].nodeValue )
                    if (methodMatch) {
                        let method = methodMatch[1];
                        let args = methodMatch[3].split(' ').join('').split(',')
                        this.bindMethod( child, child.attributes[i].nodeName, this, method, args )
                    }
                    else if (propertyMatch) {
                        let prop = propertyMatch[1];
                        this.bindProperty( child, child.attributes[i].nodeName, this, prop )
                    }
                }
            }
        }

        onCreated() {}
        beforeRender() {}
        render() {}
        afterRender() {
            this._capturePropertyBindings()
            this._executeBindings()
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
