!!(function($) {
    "use strict";

    $.namespace = function() {
        let parts = name.split('.')
        let parent = window || GLOBAL || global
        let currentPart = ''

        for (let i = 0 ; i < parts.length ; i++) {
            currentPart = parts[i];
            parent[currentPart] = parent[currentPart] || {}
            parent = parent[currentPart]
        }

        return parent
    }

    $.defer = function() {
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

    $.import = $.namespace()

    $.bindAttribute = function(source, property, target, attribute, fn) {
        let handler = {
            set (obj, key, value) {
                if (key === property) {
                    if (fn) {
                        target.setAttribute(attribute, fn(value))
                    } else {
                        target.setAttribute(attribute, value.toString())
                    }
                }
                obj[key] = value
            }
        }
        return new Proxy(source, handler)
    }

}(window || document))