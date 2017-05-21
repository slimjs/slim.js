class PropertyBinding {
    constructor(source, target, attributeName, expression) {
        this.source = source;
        this.target = target;
        this.expression = expression;
        this.attributeName = attributeName;
    }

    execute() {
        const value = Slim.__repeaterLookup(this.target, this.source, this.expression).obj;
        this.target.setAttribute(this.attributeName, value);
        this.target[Slim.__dashToCamel(this.attributeName)] = value;
    }
}

class PropertyMethodBinding {
    constructor(source, target, attributeName, rxMethod) {
        this.source = source;
        this.target = target;
        this.attributeName = attributeName;
        this.methodName = rxMethod[1];
        this.expressions = rxMethod[3].replace(' ', '').split(',');
        this.properties = this.expressions.map( expression => {
            return expression.split('.')[0];
        });
    }

    execute() {
        const values = this.expressions.map( expression => {
            return Slim.__repeaterLookup(this.target, this.source, expression).obj
        });
        const value = this.source[ this.methodName ].apply( this.source, values );
        this.target.setAttribute(this.attributeName, value);
        this.target[Slim.__dashToCamel(this.attributeName)] = value;
    }
}

class TextBinding {
    constructor(source, target, sourceInnerText) {
        this.source = source;
        this.target = target;
        this.sourceInnerText = sourceInnerText;
    }
    execute() {
        this.target.innerText = this.sourceInnerText;
        let match = this.sourceInnerText.match(Slim.rxTextMethod);
        match && match.forEach( expression => {
            const matches = expression.match(Slim.rxMethod);
            const methodName = matches[1];
            const props = matches[3].split(' ').join('').split(',');
            const values = props.map( expr => {
                return Slim.__repeaterLookup(this.target, this.source, expr ).obj;
            });
            const value = this.source[ methodName ].apply( this.source, values );
            this.target.innerText = this.target.innerText.replace(expression, value);
        });
        match = this.target.innerText.match(Slim.rxTextProp);
        match && match.forEach( expression => {
            const deepProperty = expression.match(Slim.rxProp)[1];
            const value = Slim.__repeaterLookup(this.target, this.source, deepProperty).obj;
            this.target.innerText = this.target.innerText.replace(expression, value);
        });
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
            // const customElements = window.customElements || window.CustomElements;
            // customElements.define(tag, clazz);
            document.registerElement(tag, clazz);
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

    static __repeaterLookup(element, scopeElement, expression) {
        const r = Slim.__lookup(element, expression);
        const s = Slim.__lookup(scopeElement, expression);
        if (r.obj) {
            return r;
        }
        return s;
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

    static executeBindings(target) {
        target._root && target._root.querySelectorAll('*').forEach( node => {
            if (node._bindings) {
                const values = Object.keys(node._bindings).map(key => node._bindings[key]);
                values.forEach( binding => {
                    binding.forEach( bind => bind.execute() );
                });
            }
        });
    }

    static captureBindings(target) {
        target._root && target._root.querySelectorAll('*').forEach(child => {

            // check for repeater
            if (child.hasAttribute('slim-repeat')) {
                const repeater = document.createElement('slim-repeat');
                repeater.sourceNode = child;
                repeater.setAttribute('repeat-source', child.getAttribute('slim-repeat'));
                repeater.setAttribute('repeat-as', child.getAttribute('slim-repeat-as') || 'data');
                repeater.boundParent = target;
                child.removeAttribute('slim-repeat');
                child.removeAttribute('slim-repeat-as');
                child.parentNode.insertBefore(repeater, child);
                child.parentNode.removeChild(child);
                repeater.renderList();
                return;
            }

            // not a repeater
            for (let i = 0; i < child.attributes.length; i++) {
                const attribute = child.attributes[i];

                if (attribute.nodeName === 'bind') {
                    let expressions = {};
                    const tProp = Slim.rxTextProp.exec(child.innerText);
                    const mProp = Slim.rxTextMethod.exec(child.innerText);
                    tProp && tProp.forEach( match => {
                        const breakDown = match.match(Slim.rxProp);
                        if (breakDown) {
                            const prop = breakDown[1];
                            expressions[prop] = true;
                        }
                    });
                    mProp && mProp.forEach( match => {
                        const breakDown = match.match(Slim.rxMethod);
                        if (breakDown) {
                            const props = breakDown[3].split(' ').join('').split(',');
                            props.forEach( prop => {
                                expressions[prop] = true;
                            })
                        }
                    });
                    Object.keys(expressions).forEach(expression => {
                        const property = expression.split('.')[0];
                        Slim.initBindings(target, child, property);
                        const bind = new TextBinding(target, child, child.innerText);
                        child._bindings[property].push(bind);
                    });
                    continue;
                }
                const isProp = Slim.rxProp.exec(attribute.nodeValue);
                const isMProp = Slim.rxMethod.exec(attribute.nodeValue);

                if (isProp) {
                    const expression = isProp[1];
                    const property = expression.split('.')[0];
                    const bind = new PropertyBinding(target, child, attribute.nodeName, expression);
                    Slim.initBindings(target, child, property);
                    child._bindings[property].push(bind);
                    bind.execute();
                    continue;
                }

                if (isMProp) {
                    const bind = new PropertyMethodBinding(target, child, attribute.nodeName, isMProp);
                    bind.properties.forEach( property => {
                        Slim.initBindings(target, child, property);
                        child._bindings[property].push(bind);
                        bind.execute();
                    });
                    continue;
                }
            }
        });
    }

    static initBindings(source, target, name) {
        target._bindings = target._bindings || {};
        source._bindingsValues = source._bindingsValues || {};
        source.__returnAsIs = source.__returnAsIs || function(x) { return x; }
        if (name) {
            target._bindings[name] = target._bindings[name] || [];
            const originalSetter = source.__lookupSetter__(name);
            let newSetter;
            if (!originalSetter) {
                newSetter = function(x) {
                    this._bindingsValues[name] = x;
                    Slim.executeBindings(this);
                };
                newSetter.isBindingSetter = true;
            } else if (!originalSetter.isBindingSetter) {
                newSetter = function(x) {
                    this._bindingsValues[name] = x;
                    originalSetter.call(this, x);
                    Slim.executeBindings(this);
                };
            }
            if (newSetter) {
                source._bindingsValues[name] = source[name];
                source.__defineSetter__(name, newSetter);
                source.__defineGetter__(name, function() {
                    return this._bindingsValues[name];
                });
            }
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
        Slim.executeBindings(this);
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
                clone.parentNode && clone.parentNode.removeChild(clone);
            });
        }
        this.clones = [];
    }

    get dataSource() {
        const expression = this.getAttribute('repeat-source');
        return Slim.__lookup(this.boundParent, expression).obj || [];
    }

    get useShadow() { return false; }

    renderList() {
        const targetProp = this.getAttribute('repeat-as');
        if (this.isRendering) return;
        this.isRendering = true;
        this.clearList();
        this.dataSource.forEach( (dataItem, idx) => {
            const clone = this.sourceNode.cloneNode(true);
            clone.setAttribute('slim-repeat-index', idx);
            clone[targetProp] = dataItem;
            clone._isRepeated = true;
            this.clones.push(clone);
            this.insertAdjacentElement('beforeEnd', clone);
        });
        Slim.captureBindings(this.boundParent);
        Slim.executeBindings(this.boundParent);
        this.isRendering = false;
    }
}

Slim.tag('slim-repeat', null, SlimRepeater);