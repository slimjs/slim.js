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
            target.prototype.__defineGetter__('useShadow', function() { return value; })
        }
    }

    // bindable: function() {
    //     const args = Array.prototype.slice.call(arguments)
    //     return function(target) {
    //         target.prototype._isPropertyBindable = function (prop) {
    //             return args.indexOf(prop) >= 0
    //         }
    //     }
    // }
};