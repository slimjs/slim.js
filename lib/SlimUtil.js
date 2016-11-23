!!(function($) {
    "use strict";

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

    $.later = function later(fn) {
        "use strict";
        let t = setTimeout(() => {
            clearTimeout(t)
            fn()
        }, 0)
    }

    $.import = $.namespace()

}(window || document))