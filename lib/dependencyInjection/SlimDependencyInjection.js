+(function(document) {
    "use strict";

    var __factories = {}

    class SlimDependencyInjection {

        define(nodeName, factory, eventName = 'elementAdded', setter = '$dependency') {
            __factories[eventName] = __factories[eventName] || SlimDependencyInjection._createWatch(eventName)
            __factories[eventName][nodeName.toLowerCase()] = { factory: factory, setter: setter }
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

    document.SlimInjector = new SlimDependencyInjection()

}(document))