const Slim = require('./Slim');

module.exports = {
    tag: function(selector) {
        return function(target) {
            Slim.tag(selector, target);
        };
    },

    template: function(tpl) {
        return function(target) {
            target.prototype.__defineGetter__('template', () => {
                return tpl;
            });
        }
    },

    useShadow: function(value) {
        return function(target) {
            target.prototype.__defineGetter__('useShadow', () => {
                return value;
            })
        }
    }
}