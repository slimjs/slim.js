import { parse } from './expression.js';
import { Registry } from './directive.js';
import { isForcedUpdate, Slim } from './component.js';
import { debug, repeatContext, creationBlock, internals } from './internals.js';
import { lazyQueue } from './utils.js';

const NOOP = () => void 0;

/**
 * @typedef {{[internals]: Record<string, Set<Function>>}} WithInternals
 */

/**
 * @typedef FlushOptions
 * @property {string[]} [skip]
 * @property {string[]} [keys]
 */

/**
 * @type {WeakMap<WithInternals, Record<string, Set<WithInternals>>>}
 */
const bindMap = new WeakMap();

window.bindMap = bindMap;

/**
 *
 * @param {WithInternals} source
 * @param {WithInternals} target
 * @param {string} property
 * @param {Function} execution
 * @returns {Function} remove bind function
 */
export function createBind(source, target, property, execution) {
  let propToTarget = /** @type Record<String, Set<WithInternals>> */ (
    bindMap.get(source) || bindMap.set(source, {}).get(source)
  );
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
  return () => meta[property].delete(execution);
}

/**
 *
 * @param {WithInternals} source
 * @param {string} property
 * @param {any} [value]
 */
function runBinding(source, property, value = source[property]) {
  function runOneBind(meta, property, resolvedValue = value) {
    (meta[property] || []).forEach((target) => {
      target[internals][property].forEach((fn) => fn(value));
    });
  }
  let propToTarget = /** @type Record<String, Set<WithInternals>> */ (
    bindMap.get(source) || bindMap.set(source, {}).get(source)
  );
  if (property !== '*') {
    runOneBind(propToTarget, property);
  } else {
    Object.keys(propToTarget).forEach((key) => runOneBind(propToTarget, key, source[key]));
  }
}

export function removeBindings(source, target, property) {
  let propToTarget = /** @type Record<String, Set<WithInternals>> */ (
    bindMap.get(source)
  );
  let meta = propToTarget[property];
  if (meta) {
    meta.delete(target);
  }
}

/**
 *
 * @param {any} scope
 * @param {Node} dom
 *
 */
export function processDOM(scope, dom) {
  const walker = document.createTreeWalker(
    dom,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
  );
  /** @type {Function[]} */
  const unbinds = [];
  /** @type {Function[]} */
  const bounds = [];
  let currentNode = /** @type {Node&WithInternals} */ (
    walker.currentNode || walker.nextNode()
  );
  /** @type {Set<Attr>} */
  const pendingRemoval = new Set();
  const directives = Registry.getDirectives();
  for (
    ;
    currentNode;
    currentNode = /** @type {Node&WithInternals} */ (walker.nextNode())
  ) {
    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const context = (currentNode[repeatContext] =
        currentNode[repeatContext] ||
        currentNode.parentElement?.[repeatContext] ||
        {});
      if (
        currentNode.nodeName.includes('-') &&
        typeof currentNode[creationBlock] === 'undefined'
      ) {
        currentNode[creationBlock] = true;
      }
      if (currentNode[creationBlock] === 'abort') {
        continue;
      }
      const attributes = Array.from(
        /** @type {HTMLElement&WithInternals} */ (currentNode).attributes
      );
      let i = 0,
        l = attributes.length;
      attributes_loop: for (i; i < l; i++) {
        const attr = attributes[i];
        const attrName = attr.nodeName;
        const attrValue = attr.nodeValue;
        if (currentNode[creationBlock] === 'abort') {
          break attributes_loop;
        }
        const expression = (attr.nodeValue || '').trim();
        const userCode =
          expression.startsWith('{{') && expression.endsWith('}}')
            ? expression.slice(2, -2)
            : expression;
        const { paths } = expression.includes('{{')
          ? parse(userCode)
          : { paths: [] };
        directives_loop: for (const directive of directives) {
          if (currentNode[creationBlock] === 'abort') {
            break directives_loop;
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
              targetNode: /** @type {HTMLElement&WithInternals} */ (
                currentNode
              ),
            });
            if (removeAttribute) {
              pendingRemoval.add(attr);
            }
            if (invocation) {
              const fn = directive.noExecution
                ? () => {}
                : new Function('item', `return ${userCode}`);
              const update = (altContext = context) => {
                try {
                  const value = fn.call(scope, altContext);
                  invocation(value, isForcedUpdate(scope));
                } catch (err) {
                  console.warn(err);
                }
              };
              bounds.push(update);
              [...paths].forEach((path) => {
                unbinds.push(createBind(scope, currentNode, path, update));
              });
            }
          }
        }
      }
    } else if (currentNode.nodeType === Node.TEXT_NODE) {
      const context = /** @type {Text} */ (/** @type {unknown} */ (currentNode))
        .parentElement?.[repeatContext];
      const expression = currentNode.nodeValue || '';
      if (!expression.includes('{{')) continue;
      // @ts-expect-error
      let breakNode = /** @type {Text|undefined} */ (currentNode);
      while (breakNode) {
        let index = ('' + breakNode.nodeValue).indexOf('}}');
        if (index >= 0) {
          breakNode = breakNode.splitText(index + 2);
        } else {
          breakNode = undefined;
        }
      }
      const { paths, expressions } = parse(expression);
      const oText = expression;
      const map = [...expressions, '{{item}}'].reduce(
        (/** @type {any} */ o, e) => {
          o[e] = new Function('item', `return ${e.slice(2, -2)}`);
          return o;
        },
        {}
      );
      const targetNode = /** @type {Text} */ (
        /** @type {unknown} */ (currentNode)
      );
      const update = (altContext = context) => {
        try {
          const text = Object.keys(map).reduce((text, current) => {
            try {
              const joinValue = map[current].call(scope, altContext);
              let resolvedValue =
                typeof joinValue === 'undefined' ? '' : joinValue;
              return text.split(current).join(resolvedValue);
            } catch (err) {
              return text.split(current).join('');
            }
          }, oText);
          targetNode.nodeValue = text;
        } catch (err) {
          console.warn(err);
        }
      };
      bounds.push(update);
      paths.forEach((path) =>
        unbinds.push(createBind(scope, currentNode, path, update))
      );
    }
  }
  if (!Slim[debug]) {
    Array.from(pendingRemoval).forEach(
      (attr) =>
        attr.ownerElement &&
        /** @type {Element} */ (attr.ownerElement).removeAttribute(
          attr.nodeName
        )
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
