import { parse } from './expression.js';
import { DirectiveRegistry } from './enhance.js';
import {
  isForcedUpdate,
  lazyQueue,
  createFunction,
  NOOP,
  findCtx,
} from './utils.js';
import { repeatCtx, block, internals, debug } from './internals.js';
import Slim from './component.js';

const ea = [];
const eo = {};
const ABORT = 'abort';

const walkerFilter = NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT;

/**
 * @param {any} o
 * @param {string} t
 * @returns {boolean}
 */
const type = (o, t) => typeof o === t;

const bindMap = new WeakMap();

const extract = (ctx) => (type(ctx, 'function') ? ctx() : ctx);

export const createBind = (source, target, property, execution) => {
  let propToTarget = bindMap.get(source) || bindMap.set(source, {}).get(source);
  if (!propToTarget[property]) {
    const oSet = (Object.getOwnPropertyDescriptor(source, property) || eo).set;
    let value = source[property];
    Object.defineProperty(source, property, {
      get: () => value,
      set: (v) => {
        if (v !== value || type(v, 'object')) {
          value = v;
          if (oSet) {
            oSet(v);
          }
          runBinding(source, property, value);
        }
      },
    });
  }
  (propToTarget[property] = propToTarget[property] || new Set()).add(target);
  let meta = (target[internals] = target[internals] || {});
  if (type(property, 'symbol')) return NOOP;
  (meta[property] = meta[property] || new Set()).add(execution);
  return () => {
    meta[property].delete(execution);
  };
};

const runOneBind = (meta, property, resolvedValue) => {
  (meta[property] || ea).forEach((target) => {
    target[internals][property].forEach((fn) =>
      fn(target[repeatCtx] || resolvedValue)
    );
  });
};

export const runBinding = (source, property, value) => {
  let propToTarget = bindMap.get(source) || bindMap.set(source, {}).get(source);
  if (property !== '*') {
    runOneBind(propToTarget, property, value);
  } else {
    Object.keys(propToTarget).forEach((key) =>
      runOneBind(propToTarget, key, source[key])
    );
  }
};

export function removeBindings(source, target, property = '*') {
  let propToTarget = bindMap.get(source) || eo;
  if (property === '*') {
    Object.keys(propToTarget).forEach((key) =>
      removeBindings(source, target, key)
    );
    return;
  }
  let meta = propToTarget[property];
  if (meta) {
    const localWalker = document.createTreeWalker(target, walkerFilter);
    /** @type {Node|null} */
    let node = localWalker.currentNode;
    while (node) {
      meta.delete(node);
      node = localWalker.nextNode();
    }
  }
}

/**
 *
 * @param {any} scope
 * @param {Node} dom
 *
 */
export const processDOM = (scope, dom) => {
  /** @type Set<Function> */
  const unbinds = new Set();
  /** @type Set<Function> */
  const bounds = new Set();
  /** @type Set<Attr> */
  const pendingAttributesToRemove = new Set();
  /** @type Set<Element> */
  const pendingNodesToRemove = new Set();
  const directives = DirectiveRegistry.getAll();

  const walker = document.createTreeWalker(dom, walkerFilter);
  /**
   * @type {Node|null}
   */
  let currentNode = walker.currentNode || walker.nextNode();
  for (; currentNode; currentNode = walker.nextNode()) {
    const currentNodeRef = currentNode;
    currentNode.nodeType;
    currentNode.nodeValue;
    currentNode.addEventListener;
    const nodeName = currentNode.nodeName;
    const defaultContext = () => findCtx(currentNodeRef);

    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const targetNode = /** @type {Element} */ (currentNode);
      if (nodeName.includes('-') && type(targetNode[block], 'undefined')) {
        targetNode[block] = true;
        requestAnimationFrame(() => (targetNode[block] = false));
      }
      if (targetNode[block] === ABORT) {
        continue;
      }
      const attributes = Array.from(targetNode.attributes);
      let i = 0,
        l = attributes.length;
      a_l: for (i; i < l; i++) {
        const attr = attributes[i];
        const attrName = attr.nodeName;
        const attrValue = attr.nodeValue || '';
        if (currentNode[block] === ABORT) {
          break a_l;
        }
        const expression = attrValue.trim();
        const userCode =
          expression.startsWith('{{') && expression.endsWith('}}')
            ? expression.slice(2, -2)
            : expression;
        /** @type {string[]} */
        const paths = expression.includes('{{') ? parse(userCode).paths : ea;
        d_l: for (const directive of directives) {
          if (currentNode[block] === ABORT) {
            break d_l;
          }
          if (directive.attribute(attr, attrName, attrValue)) {
            const {
              update: invocation,
              removeAttribute,
              removeNode,
            } = directive.process({
              attribute: attr,
              attributeName: attrName,
              attributeValue: attrValue,
              context: defaultContext,
              expression: userCode,
              props: paths,
              scopeNode: scope,
              targetNode,
              targetNodeName: nodeName,
            });
            if (removeAttribute) {
              pendingAttributesToRemove.add(attr);
            }
            if (removeNode) {
              pendingNodesToRemove.add(targetNode);
            }
            if (invocation) {
              const fn = directive.noExecution
                ? NOOP
                : createFunction('item', `return ${userCode}`);
              const update = (altContext = defaultContext()) => {
                try {
                  const value =
                    fn === NOOP
                      ? undefined
                      : fn.call(scope, extract(altContext));
                  invocation(value, isForcedUpdate(scope));
                } catch (err) {
                  // console.warn(err);
                }
              };
              bounds.add(update);
              paths.forEach((path) => {
                unbinds.add(createBind(scope, currentNode, path, update));
              });
            }
          }
        }
      }
    } else if (currentNode.nodeType === Node.TEXT_NODE) {
      const expression = /** @type string **/ (currentNode.nodeValue);
      if (!expression.includes('{{')) continue;
      /** @type {Text} */
      let breakNode = /** @type {Text} */ (currentNode);
      while (breakNode) {
        let index = ('' + breakNode.nodeValue).indexOf('}}');
        if (index >= 0) {
          breakNode = breakNode.splitText(index + 2);
        } else {
          break;
        }
      }
      const { paths, expressions } = parse(expression);
      const oText = expression;
      const map = [...expressions, '{{item}}'].reduce(
        (/** @type {any} */ o, e) => {
          o[e] = createFunction('item', `return ${e.slice(2, -2)}`);
          return o;
        },
        {}
      );
      const targetNode /** @type {Text} */ = /** @type {unknown} */ currentNode;
      const update = (altContext = defaultContext()) => {
        const text = Object.keys(map).reduce((text, current) => {
          const joinValue = map[current].call(scope, extract(altContext));
          let resolvedValue = type(joinValue, 'undefined') ? '' : joinValue;
          return text.replaceAll(current, resolvedValue);
        }, oText);
        targetNode.textContent = text;
        // try {
        // } catch (err) {}
      };
      bounds.add(update);
      paths.forEach((path) =>
        unbinds.add(createBind(scope, currentNode, path, update))
      );
    }
  }
  pendingNodesToRemove.forEach((e) => e.remove());
  if (!Slim[debug]) {
    pendingAttributesToRemove.forEach((attr) => {
      try {
        /** @type {Element} */ attr.ownerElement.removeAttribute(attr.nodeName);
      } catch (e) {}
    });
  }
  return {
    /**
     * @param {...string} props
     */
    flush: function (...props) {
      if (arguments.length) {
        props.forEach((key) => runBinding(scope, key));
      } else {
        runBinding(scope, '*');
      }
    },
    clear: () => lazyQueue(unbinds),
    bounds,
  };
};
