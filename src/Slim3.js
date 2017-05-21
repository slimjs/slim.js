class PropertyBinding {
    constructor(source, target, attributeName, expression) {
        this.source = source;
        this.target = target;
        this.expression = expression;
        this.attributeName = attributeName;
    }

    execute() {
        const value = Slim.__lookup(this.source, this.expression).obj;
        this.target.setAttribute(this.attributeName, value);
        this.target[Slim.__dashToCamel(this.attributeName)] = value;
    }
}

class Slim extends HTMLElement {

    /**
     * Declares a slim component
     *
     * @param {String} tag html tag name
     * @param {String|class|function} clazzOrTemplate the template string or the class itself
     * @param {class|function} clazz if not given as second argument, mandatory after the template
     */
    static tag(tag, clazzOrTemplate, clazz) {
        if (clazz === undefined) {
            clazz = clazzOrTemplate;
        } else {
            Slim.__templateDict[tag] = clazzOrTemplate;
        }
        Slim.__prototypeDict[tag] = clazz;
        clazz.prototype.__defineGetter__('template', () => {
            return Slim.__templateDict[tag];
        });

        // window.customElements.define(tag, clazz);
        // if (Slim.__prototypeDict['slim-repeat'] === undefined) {
        //     Slim.__initRepeater();
        // }
        setTimeout( () => {
            window.customElements.define(tag, clazz);
        }, 0);
    }

    /**
     *
     * @param dash
     * @returns {XML|void|string|*}
     * @private
     */
    static __dashToCamel(dash) {
        return dash.indexOf('-') < 0 ? dash : dash.replace(/-[a-z]/g, m => {return m[1].toUpperCase()})
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param camel
     * @returns {string}
     * @private
     */
    static __camelToDash(camel) {
        return camel.replace(/([A-Z])/g, '-$1').toLowerCase();
    }

    /**
     *
     * @param obj
     * @param desc
     * @returns {{source: *, prop: *, obj: *}}
     * @private
     */
    static __lookup(obj, desc) {
        let arr = desc.split(".");
        let prop = arr[0];
        while(arr.length && obj) {
            obj = obj[prop = arr.shift()]
        }
        return {source: desc, prop:prop, obj:obj};
    }

    constructor() {
        super();
        this.createdCallback();
    }

    static create(target) {
        if (target.useShadow) {
            target._root = target.createShadowRoot();
        } else {
            target._root = target;
        }
    }

    static render(target) {
        target._transcludedChildren = [];
        while (target.firstChild) {
            target._transcludedChildren.push(target.firstChild);
            target.removeChild(target.firstChild);
        }
        target._root.innerHTML = target.template || '';
        const transcludeHost = target._root.querySelector('slim-content');
        transcludeHost && target._transcludedChildren.forEach(child => {
            transcludeHost.appendChild(child);
        });
    }

    static captureBindings(target) {
        target._root && target._root.querySelectorAll('*').forEach(child => {
            for (let i = 0; i < child.attributes.length; i++) {
                const attribute = child.attributes[i];
                const isProp = Slim.rxProp.exec(attribute.nodeValue);

                if (isProp) {
                    const expression = isProp[1];
                    const property = expression.split('.')[0];
                    const bind = new PropertyBinding(target, child, attribute.nodeName, expression);
                    Slim.initBindings(child, property);
                    child._bindings[property].push(bind);
                }
            }
        });
    }

    static initBindings(target, name) {
        target._bindings = target._bindings || {};
        if (name) {
            target._bindings[name] = target._bindings[name] || [];
        }
    }

    static update(target) {
        target.onBeforeUpdate();
        // update
        target.onUpdate();
    }

    createdCallback() {
        if (this.__createdCallbackInvoked) return;
        this.__createdCallbackInvoked = true;
        this.onBeforeCreated();
        Slim.create(this);
        this.onCreated();
        this.onBeforeRender();
        Slim.render(this);
        Slim.captureBindings(this);
        this.onRender();
    }

    get template() { return null; }
    onBeforeCreated() {}
    onCreated() {}
    onBeforeRender() {}
    onRender() {}
    onBeforeUpdate() {}
    onUpdate() {}
}

Slim.__uqIndex = 0;
Slim.rxInject = /\{(.+[^(\((.+)\))])\}/;
Slim.rxProp = /\[\[(.+[^(\((.+)\))])\]\]/;
Slim.rxMethod = /\[\[(.+)(\((.+)\)){1}\]\]/;
Slim.rxTextMethod = /\[\[(\w+)\((.+)\)]\]/g;
Slim.rxTextProp = /\[\[([\w|.]+)\]\]/g;
Slim.__templateDict = {};
Slim.__prototypeDict = {};
try {
    Slim.__isNative = (function() {
        return ('registerElement' in document
        && 'import' in document.createElement('link')
        && 'content' in document.createElement('template'))
    })()
}
catch (err) {
    Slim.__isNative = false
}

try {
    Slim.__isIE11 = (function() {
        return !!window['MSInputMethodContext'] && !!document['documentMode'];
    })();
}
catch (err) {
    Slim.__isIE11 = false;
}





class SlimRepeater extends Slim {

    get useShadow() { return false; }

    clearList() {
        if (this.clones) {
            this.clones.forEach( clone => {
                Slim.removeChild(clone);
            })
        }
        this.clones = [];
    }

    renderList() {
        if (this.isRendering) return;
        this.isRendering = true;
        this.clearList();
        this.dataSource.forEach( (dataItem, idx) => {
            const clone = this.sourceNode.cloneNode(true);
            this.clones.push(clone);
            this.root.appendChild(clone);
            clone.setAttribute('slim-repeat-index', idx);
            [clone].concat(Slim.findAll(clone, '*')).forEach( element => {
                element.__boundParent = this.__boundParent;
                element.__isRepeated = true;
                element[this.targetProp] = dataItem;
                element.data_index = idx;
            });
        });
        Slim.captureBindings(this.__boundParent);
        Slim.applyBindings(this.__boundParent);
        Slim.renderElement(this.__boundParent);
        this.isRendering = false;
    }
}

Slim.tag('slim-repeat', null, SlimRepeater);