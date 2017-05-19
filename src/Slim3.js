class Slim extends HTMLElement {
    /** @namespace window.customElements */

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
        setTimeout( () => {
            document.registerElement(tag, clazz);
        }, 0);
    }

    /**
     *
     * @param obj
     * @param desc
     * @returns {{source: *, prop: *, obj: *}}
     * @private
     */
    static __lookup(obj, desc) {
        if (!obj) {
            return {source: desc, prop:desc, obj:obj}
        }
        let arr = desc.split(".");
        let prop = arr[0];
        while(arr.length && obj) {
            obj = obj[prop = arr.shift()]
        }
        return {source: desc, prop:prop, obj:obj};
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
     * @param source
     * @param target
     * @param activate
     * @private
     */
    static moveChildrenBefore(source, target, activate) {
        while (source.firstChild) {
            target.parentNode.insertBefore(source.firstChild, target)
        }
        let children = Slim.selectorToArr(target, '*');
        for (let child of children) {
            if (activate && child.isSlim) {
                child.createdCallback()
            }
        }
    }

    /**
     *
     * @param source
     * @param target
     * @param activate
     * @private
     */
    static moveChildren(source, target, activate) {
        while (source.firstChild) {
            target.appendChild(source.firstChild)
        }
    }

    /**
     * Polyfill for IE11 support
     * @param target
     */
    static removeChild(target) {
        if (target.remove) {
            target.remove();
        }
        if (target.parentNode) {
            target.parentNode.removeChild(target);
        }
        if (target.__ieClone) {
            Slim.removeChild(target.__ieClone);
        }
        if (target._boundChildren) {
            target._boundChildren.forEach( child => {
                if (child.__ieClone) {
                    Slim.removeChild(child.__ieClone);
                }
            });
        }
    }

    static initBindings(target, property) {
        target._bindings = target._bindings || {};
        if (property) {
            target._bindings[property] = target._bindings[property] || {};
        }
    }

    static extendSetter(target, propertyName, executor) {
        Slim.initBindings(target, propertyName);
        let originalSetter = target.__lookupSetter__(propertyName);
        if (!originalSetter) {
            const originalValue = target[propertyName];
            target.__defineSetter__(propertyName, function(x) {
                target._bindings[propertyName].value = x;
                if (typeof target[propertyName + 'Changed'] === 'function') {
                    target[propertyName + 'Changed'](x);
                }
            });
            target._bindings[propertyName].value = originalValue;
            target.__defineGetter__(propertyName, function() {
                if (target._bindings && target._bindings[propertyName]) {
                    return target._bindings[propertyName].value;
                }
                else {
                    return originalValue;
                }
            });
            originalSetter = target.__lookupSetter__(propertyName);
        }
        target.__defineSetter__(propertyName, x => {
            if (originalSetter) {
                originalSetter(x);
            }
            executor(x);
        });
    }

    static bindAttributeToProperty(element, rxProp, attr) {
        if (element._locked) return;
        const expression = rxProp[1];
        const d = Slim.__lookup(element.__boundParent, expression);
        const propertyName = d.prop;
        Slim.extendSetter(element.__boundParent, propertyName, () => {
            element.setAttribute(attr, d.obj);
            element[Slim.__dashToCamel(attr)] = d.obj;
        });
    }

    static bindAttributeToMethod(element, rxMethod, attr) {
        if (element._locked) return;
        const expressions = rxMethod[3].replace(' ','').split(',');
        const methodName = rxMethod[1];
        expressions.forEach(expression => {
            const propertyName = expression.split('.')[0];
            Slim.extendSetter(element.__boundParent, propertyName, () => {
                const value = element.__boundParent[methodName].apply(element.__boundParent,
                    expressions.map(expression => {
                        return Slim.__lookup(element.__boundParent, expression ).obj;
                    }));
                element.setAttribute(attr, value);
                element[Slim.__dashToCamel(attr)] = value;
            });
        });
    }

    static findAll(target, selector) {
        return Array.prototype.slice.call(target.querySelectorAll(selector));
    }

    static initPhantomDOM(target) {
        const template = target.template || ''
        target.__phantomDOM = document.createRange().createContextualFragment(template);
        target.__phantomDOM.root = target;
    }

    static applyBindings(scopeElement) {
        Object.keys(scopeElement._bindings).forEach( property => {
            const descriptor = Object.getOwnPropertyDescriptor(scopeElement, property);
            descriptor.set( descriptor.get() );
        });
    }

    static captureTextBinding(child) {
        if (child._locked) return;
        const scopeElement = child.__boundParent;
        child.__sourceInnerText = child.innerText;
        child.__textBindings = [];

        // simple bindings
        let match = child.__sourceInnerText.match(/\[\[([\w|.]+)\]\]/g);
        if (match && child.children.firstChild) {
            throw 'Bind Error: Illegal bind attribute use on element type ' + child.localName + ' with nested children.\n' + child.outerHTML;
        }
        if (match) {
            let expressions = [];
            for (let i = 0; i < match.length; i++) {
                let lookup = match[i].match(/([^\[].+[^\]])/)[0];
                expressions.push(lookup)
            }
            expressions.forEach( expression => {
                let prop = expression.split('.')[0];
                Slim.extendSetter(scopeElement, prop, () => {
                    child.innerText = child.__sourceInnerText;
                    Slim.applyTextBinding(child);
                });
                child.__textBindings.push( () => {
                    const dbp = Slim.__lookup(scopeElement, expression).obj;
                    const dbr = Slim.__lookup(child, expression).obj;
                    const value = dbr !== undefined ? dbr : dbp;
                    child.innerText = child.innerText.replace(`[[${expression}]]`, value);
                });
            });
        }
    }

    static applyTextBinding(target) {
        if (typeof target.onBeforeUpdate === 'function') {
            target.onBeforeUpdate();
        }
        if (target.__textBindings) {
            target.__textBindings.forEach( executor => {
                executor(executor.descriptor);
            })
        }
        if (typeof target.onUpdate === 'function') {
            target.onUpdate();
        }
    }

    static applyInteractionEvent(target, eventName, callbackName) {
        target.addEventListener(eventName, (e) => {
            target.__boundParent[callbackName](e);
        });
    }

    static captureElementBinding(element) {
        if (element.hasAttribute('s-repeat')) {
            element._locked = true;
        }
        if (element.attributes) for (let i = 0; i < element.attributes.length; i++) {

            const attribute = element.attributes[i];
            const attributeName = attribute.nodeName;
            const attributeValue = attribute.nodeValue;

            if (attributeName === 'slim-id') {
                element.__boundParent[attributeValue] = element;
                continue;
            }

            if (attributeName === 'bind' && !element._locked) {
                Slim.captureTextBinding(element);
                continue;
            }

            if (Slim.interactionEventNames.indexOf(attributeName) >= 0) {
                Slim.applyInteractionEvent(element, attributeName, attributeValue);
                continue;
            }

            if (attributeName === 's-repeat') {
                Slim.createRepeater(element, attributeValue);
                continue;
            }

            const rxProp = !element._locked && Slim.rxProp.exec(attributeValue);
            const rxMethod = !element._locked && Slim.rxMethod.exec(attributeValue);

            // ...

            if (rxMethod) {
                Slim.bindAttributeToMethod(element, rxMethod, attribute.nodeName);
            }

            if (rxProp) {
                Slim.bindAttributeToProperty(element, rxProp, attribute.nodeName);
            }
        }
    }

    static captureBindings(scopeElement) {
        Slim.moveChildren(scopeElement.root, scopeElement.__phantomDOM);

        const children = Slim.findAll(scopeElement.__phantomDOM, '*');
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.__bound) continue;
            child.__boundParent = child.__boundParent || scopeElement;
            Slim.captureElementBinding(child);
            child.__bound = true;
            continue;
        }
    }

    static renderElement(target) {
        if (target.__phantomDOM) {
            Slim.moveChildren(target.__phantomDOM, target.root);
        }
    }

    /**
     * Supported HTML events built-in on slim components
     * @returns {Array<String>}
     */
    static get interactionEventNames() {
        return ['click','mouseover','mouseout','mousemove','mouseenter','mousedown','mouseup','dblclick','contextmenu','wheel',
            'mouseleave','select','pointerlockchange','pointerlockerror','focus','blur',
            'input', 'error', 'invalid',
            'animationstart','animationend','animationiteration','reset','submit','resize','scroll',
            'keydown','keypress','keyup', 'change']
    }

    static __createUqIndex() {
        Slim.__uqIndex++;
        return Slim.__uqIndex.toString(16);
    }

    static initUniqueIdentifier(target) {
        target.uq_index = Slim.__createUqIndex();
        target.setAttribute('slim-uq', target.uq_index);
    }

    static bootstrap(target) {
        target.createdCallback();
    }

    get isSlim() {
        return true;
    }

    /**
     * Override and provide a template, if not given in the tag creation process.
     * @returns {*|null}
     */
    get template() {
        return (Slim.__templateDict[ this.nodeName.toLowerCase()]) || null;
    }

    get useShadow() {
        return false;
    }

    get root() {
        if (this.useShadow) {
            this.__shadowRoot = this.__shadowRoot || this.attachShadow({mode: 'open'});
            return this.__shadowRoot;
        }
        return this;
    }

    constructor() {
        super();
        Slim.bootstrap(this);
    }

    createdCallback() {
        Slim.initPhantomDOM(this);
        Slim.initUniqueIdentifier(this);
        Slim.initBindings(this);
        this.onBeforeCreated();
        Slim.captureBindings(this);
        this.onCreated();
        Slim.applyBindings(this);
        this.onBeforeRender();
        Slim.renderElement(this);
        this.onRender();
    }

    attachedCallback() {
        this.onAdded();
    }

    detachedCallback() {
        this.onRemoved();
    }

    connectedCallback() {
        this.onAdded();
    }

    disconnectedCallback() {
        this.onRemoved();
    }

    trigger(attr, payload) {
        const fnName = this.getAttribute(attr);
        this.__boundParent[attr](payload);
    }

    find(selector) {
        return this.root.querySelector(selector);
    }

    findAll(selector) {
        return Slim.findAll(this.root, selector);
    }

    onAdded() { /* abstract */ }
    onRemoved() { /* abstract */ }
    onBeforeCreated() { /* abstract */ }
    onCreated() { /* abstract */}
    onBeforeRender() { /* abstract */ }
    onRender() { /* abstract */ }
    onBeforeUpdate() { /* abstract */ }
    onUpdate() { /* abstract */ }

    static createRepeater(sourceNode, expression) {
        const rootProp = expression.split('.')[0];
        const repeater = document.createElement('slim-repeat');
        repeater.sourceNode = sourceNode;
        repeater.targetProp = sourceNode.getAttribute('s-repeat-as') || 'data';
        repeater.__boundParent = sourceNode.__boundParent;
        sourceNode.removeAttribute('s-repeat');
        [sourceNode].concat(Slim.findAll(sourceNode, '*')).forEach( childNode => childNode._locked = true);
        sourceNode.__boundParent.__phantomDOM.appendChild(repeater);
        Slim.removeChild(sourceNode);
        const executor = () => {
            const dataSource = Slim.__lookup(sourceNode.__boundParent, expression).obj;
            repeater.dataSource = dataSource || [];
            repeater.renderList();
        };

        Slim.extendSetter(sourceNode.__boundParent, rootProp, () => {
            executor();
        });

        // executor();
    }
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
            clone.setAttribute('s-repeat-index', idx);
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