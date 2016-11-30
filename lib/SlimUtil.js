!!(function($) {
    "use strict";

    $.SLIM = $.SLIM || {}
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

    $.SLIM.detectAttribute = function(attribute) {
        let methodMatch = $.SLIM.regexpMethod.exec( attribute.nodeValue )
        let propMatch = $.SLIM.regexpProp.exec( attribute.nodeValue )
        if (methodMatch) {
            return {
                type: 'M',
                attribute: attribute.nodeValue,
                method: methodMatch[1],
                props: methodMatch[3].replace(' ','').split(',')
            }
        } else if (propMatch) {
            return {
                type: 'P',
                attribute: attribute.nodeValue,
                prop: propMatch[1]
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

    $.import = $.namespace

}(window || document))