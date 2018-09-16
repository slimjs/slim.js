module.exports = {
    tag: function(selector) {
        return function(target) {
            window.Slim.tag(selector, target);
        };
    },

    template: function(tpl) {
        return function(target) {
            target.prototype.__defineGetter__('template', function() {
                return tpl;
            });
        }
    },

    useShadow: function(value) {
        return function(target) {
            target.prototype.__defineGetter__('useShadow', function() { return value; });
        }
    },

    /**
     * @experimental
     * Works only with native browser support, as polyfills breaks the prototype chain
     */
    // attribute: function(target, key, descriptor) {
    //     const clazz = target.constructor
    //     const observedAttributes = target.constructor.observedAttributes || []
    //     const attr = window.Slim.camelToDash(key);
    //     observedAttributes.push(attr);
    //     Slim._$(target).autoBoundAttributes.push(attr);
    //     Object.defineProperty(clazz, 'observedAttributes', {
    //         get: () => {
    //             return [...observedAttributes, ...Slim._$(target).autoBoundAttributes]
    //         }
    //     })
    //     Slim.wrapGetterSetter(target, key)
    //     descriptor.configurable = true
    //     descriptor.writable = true
    //     return descriptor;
    // }
};