!!(function(document, $) {
    'use strict';

    $.SLIM = $.SLIM || {}
    $.SLIM.regexpInject = /\{(.+[^(\((.+)\))])\}/
    $.SLIM.regexpProp = /\[(.+[^(\((.+)\))])\]/
    $.SLIM.regexpMethod = /\[(.+)(\((.+)\)){1}\]/

    $.SLIM.bindProperty = function bindProperty(source, target, attributeName, property, descriptor) {
        source.__bindings = source.__bindings || {}
        source.__bindings[property] = source.__bindings[property] || {
                value: source[property],
                exec: []
            }
        source.__defineSetter__(property, (x) => {
            source.__bindings[property].value = x
            source.__bindings[property].exec.forEach( (fn)=>{fn()} )
        })
        source.__defineGetter__(property, () => {
            return source.__bindings[property].value
        })
        var executor = () => {
            if (descriptor && descriptor.method) {
                let args = descriptor.props.map( (prop) => {
                    return source[prop]
                })
                let result = source[descriptor.method].apply(source,args)
                target[attributeName] = result
                target.setAttribute(attributeName, result)
                return
            }
            target[attributeName] = source.__bindings[property].value
            target.setAttribute(attributeName, source.__bindings[property].value)
        }
        source.__bindings[property].exec.push(executor)
        executor()
    }

    $.SLIM.inject = function(descriptor, target) {
        target[descriptor.attribute] = $.SlimInjector.getInjector(descriptor.inject)()
    }

    $.SLIM.detectAttribute = function(attribute) {
        let methodMatch = $.SLIM.regexpMethod.exec( attribute.nodeValue )
        let propMatch = $.SLIM.regexpProp.exec( attribute.nodeValue )
        let injectMatch = $.SLIM.regexpInject.exec( attribute.nodeValue )
        if (methodMatch) {
            return {
                type: 'M',
                attribute: attribute.nodeName,
                method: methodMatch[1],
                props: methodMatch[3].replace(' ','').split(',')
            }
        } else if (propMatch) {
            return {
                type: 'P',
                attribute: attribute.nodeName,
                prop: propMatch[1]
            }
        } else if (injectMatch) {
            return {
                type: 'I',
                attribute: attribute.nodeName,
                inject: injectMatch[1]
            }
        }
        return {}
    }



    $.getId = function(length = 24) {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('')
        let result = ''
        while (length--) {
            result += chars[ Math.floor( Math.random() * chars.length )]
        }
        return result
    }

    $.namespace = function namespace(name) {
        var parts = name.split('.');
        var parent = window || GLOBAL || global;
        var currentPart = '';

        for (var i = 0 ; i < parts.length ; i++) {
            currentPart = parts[i];
            parent[currentPart] = parent[currentPart] || {};
            parent = parent[currentPart]
        }

        return parent;
    }

    $.defer = function defer() {
        let _resolve
        let _reject
        let _promise = new Promise( (resolve, reject) => {
            _resolve = resolve
            _reject = reject
        })

        return {
            promise: _promise,
            reject: _reject,
            resolve: _resolve
        }
    }

    $.createModal = function() {
        return document.createElement('slim-modal');
    }

    $.later = function later(fn) {
        "use strict";
        let t = setTimeout(() => {
            clearTimeout(t)
            fn()
        }, 0)
    }

    var __factories = {}
    var __injectors = {}

    class SlimDependencyInjection {


        define(injectorName, factory) {
            __injectors[injectorName] = factory
        }


        inject(nodeName, factory, eventName = 'elementAdded', setter = '$dependency') {
            __factories[eventName] = __factories[eventName] || SlimDependencyInjection._createWatch(eventName)
            __factories[eventName][nodeName.toLowerCase()] = { factory: factory, setter: setter }
        }

        getInjector(name) {
            return __injectors[name]
        }

        static _createWatch(eventName) {
            document.addEventListener(eventName, (event) => {
                this._inject(eventName, event)
            })
            var result = {}
            return result
        }

        static _inject(eventName, event) {
            for (let nodeName in __factories[eventName]) {
                let target = event.srcElement || event.target
                let injector = __factories[eventName][target.nodeName.toLowerCase()] || null
                if (injector !== null) {
                    target[injector.setter] = injector.factory()
                }
            }
        }
    }

    $.SlimInjector = new SlimDependencyInjection()

    $.import = $.namespace

    class SlimBaseElement extends HTMLElement {

        constructor() {
            this._isVirtual = false
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
                this.update()
            }
        }

        update() {}
        onAdded() {}
        onRemoved() {}

        __initBinding(child, childAttributeName, own, name) {
            own.__bindings = own.__bindings || {}
            own.__bindings[ name ] = own.__bindings[ name ] || {
                    executors: [],
                    binding: child.getAttribute(childAttributeName),
                    current: own[ name],
                    initial: own[ name ] }
        }

        _destroy() {
            delete this.__bindingTree
        }

        _capturePropertyBindings() {
            this.__bindingTree.innerHTML = this.template || this.innerHTML;
            for (let child of this.__bindingTree.querySelectorAll('*')) {
                if (child.attributes) for (let i = 0; i < child.attributes.length; i++) {
                    let detection = SLIM.detectAttribute(child.attributes[i])
                    if (detection.type === 'M') {
                        detection.props.forEach( (prop) => {
                            SLIM.bindProperty(this, child, child.attributes[i].nodeName, detection.prop, detection)
                        })
                    } else if (detection.type === 'P') {
                        SLIM.bindProperty(this, child, child.attributes[i].nodeName, detection.prop)
                    } else if (detection.type === 'I') {
                        SLIM.inject(detection, child)
                    }
                }
            }
        }

        setIfVirtual() {
            this._isVirtual = false
            let parent = this
            while (parent && this._isVirtual) {
                parent = parent.parentNode
                if (parent === document.body) {
                    this._isVirtual = true
                }
            }
        }

        onCreated() {}
        beforeRender() {}
        render() {
        }
        afterRender() {
        }

        _render() {

            this.beforeRender()
            if (!this._isVirtual) {
                this.innerHTML = ''
                while (this.__bindingTree.children.length) {
                    this.appendChild(this.__bindingTree.children[0])
                }
                this.render()
                this.afterRender()
            }


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
        setAttribute(attribute, value) {
            super.setAttribute(attribute, value)
            if (value !== this.getAttribute(attribute)) {
                this.dispatchEvent(new Event('change'))
            }
            if (this._renderOnAttributes && this._renderOnAttributes.indexOf(attribute) >= 0) {
                this.update()
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
            this.__bindings = {}
            this.__bindingTree = document.createElement('x')
            this._capturePropertyBindings()
            this.dispatchEvent(new Event('elementCreated', {bubbles:true}))
            this.onCreated()
            this._render()
        }

        //noinspection JSUnusedGlobalSymbols
        attachedCallback() {
            this.dispatchEvent(new Event('elementAdded', {bubbles:true}))
            this.onAdded()
        }

        //noinspection JSUnusedGlobalSymbols
        detachedCallback() {
            this.onRemoved()
            this._destroy()
            this.dispatchEvent(new Event('elementRemoved', {bubbles:true}))
        }

        //noinspection JSUnusedGlobalSymbols
        attributeChangedCallback(attribute, oldValue, newValue) {
            if (this._renderOnAttributes.indexOf(attribute) >= 0) {
                this.update()
            }
            this.onAttributeChanged(attribute, oldValue, newValue)
        }


    }

    window.SlimBaseElement = SlimBaseElement
}(document, window))
