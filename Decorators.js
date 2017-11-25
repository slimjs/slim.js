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

    attribute: function(target, key, descriptor) {
        target.constructor.observedAttributes = target.constructor.observedAttributes || [];
        const attr = window.Slim.camelToDash(key);
        target.constructor.observedAttributes.push(attr);
        Slim._$(target.constructor).autoBoundAttributes.push(key);
        descriptor.configurable = true;
        descriptor.writable = true;
        return descriptor;
    }
};