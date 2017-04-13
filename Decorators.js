module.exports = {
    tag: function(selector) {
        return function(target) {
            window.Slim.tag(selector, target);
        };
    },

    template: function(tpl) {
        return function(target) {
            target.prototype.__defineGetter__('template', () => tpl);
        }
    },

    useShadow: function(value) {
        return function(target) {
            target.prototype.__defineGetter__('useShadow', () => value)
        }
    }
};