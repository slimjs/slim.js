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

const walkerFilter = NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT;

const bindMap = new WeakMap();

export function createBind(source, target, property, execution) {
  let propToTarget = bindMap.get(source) || bindMap.set(source, {}).get(source);
  if (!propToTarget[property]) {
    const oSet = (Object.getOwnPropertyDescriptor(source, property) || {}).set;
    let value = source[property];
    Object.defineProperty(source, property, {
      get: () => value,
      set: (v) => {
        if (v !== value) {
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
  (meta[property] = meta[property] || new Set()).add(execution);
  return () => {
    meta[property].delete(execution);
  };
}

function runBinding(source, property, value) {
  function runOneBind(meta, property, resolvedValue = value) {
    (meta[property] || []).forEach((target) => {
      target[internals][property].forEach((fn) =>
        fn(target[repeatCtx] || resolvedValue)
      );
    });
  }
  let propToTarget = bindMap.get(source) || bindMap.set(source, {}).get(source);
  if (property !== '*') {
    runOneBind(propToTarget, property);
  } else {
    Object.keys(propToTarget).forEach((key) =>
      runOneBind(propToTarget, key, source[key])
    );
  }
}

export function removeBindings(source, target, property = '*') {
  let propToTarget = bindMap.get(source) || {};
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
export function processDOM(scope, dom) {
  const walker = document.createTreeWalker(dom, walkerFilter);
  const unbinds = new Set();
  const bounds = new Set();
  /**
   * @type {Node|null}
   */
  let currentNode = walker.currentNode || walker.nextNode();
  const pendingRemoval = new Set();
  const directives = DirectiveRegistry.getAll();
  for (; currentNode; currentNode = walker.nextNode()) {
    const currentNodeRef = currentNode;
    const context = () => findCtx(currentNodeRef);

    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const targetNode = /** @type {Element} */ (currentNode);
      if (
        targetNode.nodeName.includes('-') &&
        typeof targetNode[block] === 'undefined'
      ) {
        targetNode[block] = true;
        requestAnimationFrame(() => (targetNode[block] = false));
      }
      if (targetNode[block] === 'abort') {
        continue;
      }
      const attributes = Array.from(targetNode.attributes);
      let i = 0,
        l = attributes.length;
      a_l: for (i; i < l; i++) {
        const attr = attributes[i];
        const attrName = attr.nodeName;
        const attrValue = attr.nodeValue;
        if (currentNode[block] === 'abort') {
          break a_l;
        }
        const expression = (attr.nodeValue || '').trim();
        const userCode =
          expression.startsWith('{{') && expression.endsWith('}}')
            ? expression.slice(2, -2)
            : expression;
        const { paths } = expression.includes('{{')
          ? parse(userCode)
          : { paths: [] };
        d_l: for (const directive of directives) {
          if (currentNode[block] === 'abort') {
            break d_l;
          }
          if (directive.attribute(attr, attrName, attrValue)) {
            const { update: invocation, removeAttribute } = directive.process({
              attribute: attr,
              attributeName: attrName,
              attributeValue: attrValue,
              context,
              expression: userCode,
              props: paths,
              scopeNode: scope,
              targetNode: currentNode,
            });
            if (removeAttribute) {
              pendingRemoval.add(attr);
            }
            if (invocation) {
              const fn = directive.noExecution
                ? NOOP
                : createFunction('item', `return ${userCode}`);
              const update = (altContext = context) => {
                try {
                  const value = fn.call(scope, altContext);
                  invocation(value, isForcedUpdate(scope));
                } catch (err) {
                  console.warn(err);
                }
              };
              bounds.add(update);
              [...paths].forEach((path) => {
                unbinds.add(createBind(scope, currentNode, path, update));
              });
            }
          }
        }
      }
    } else if (currentNode.nodeType === Node.TEXT_NODE) {
      const expression = currentNode.nodeValue || '';
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
      const update = (altContext = context()) => {
        try {
          const text = Object.keys(map).reduce((text, current) => {
            try {
              const joinValue = map[current].call(scope, altContext);
              let resolvedValue =
                typeof joinValue === 'undefined' ? '' : joinValue;
              return text.replaceAll(current, resolvedValue);
            } catch (err) {
              return text.replaceAll(current, '');
            }
          }, oText);
          targetNode.nodeValue = text;
        } catch (err) {
          console.warn(err);
        }
      };
      bounds.add(update);
      paths.forEach((path) =>
        unbinds.add(createBind(scope, currentNode, path, update))
      );
    }
  }
  if (!Slim[debug]) {
    Array.from(pendingRemoval).forEach(
      (attr) =>
        attr.ownerElement &&
        /** @type {Element} */ attr.ownerElement.removeAttribute(attr.nodeName)
    );
  }
  return {
    /**
     *
     * @param {FlushOptions} [options]
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
}
