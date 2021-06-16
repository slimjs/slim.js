import { parse } from './expression.js';
import { Registry } from './directive.js';
import { isForcedUpdate, Slim } from './component.js';
import {
  debug,
  repeatContext,
  creationBlock,
  requestIdleCallback,
} from './internals.js';
import { lazyQueue } from './utils.js';

const NOOP = () => void 0;

/**
 * @typedef FlushOptions
 * @property {string[]} [skip]
 * @property {string[]} [keys]
 */

/**
 *
 * @param {any} target
 * @param {Record<string, Array<Function|Function[]>>} bindings
 * @param {string} property
 * @param {Function|Function[]} execution
 */
export function bind(target, bindings, property, execution) {
  let value = target[property];
  if (!bindings[property]) {
    // first time
    bindings[property] = [execution];
    Object.defineProperty(target, property, {
      get: () => value,
      set: (v) => {
        if (v !== value) {
          value = v;
          bindings[property].flat().forEach((fn) => fn());
        }
      },
    });
  } else {
    bindings[property].push(execution);
  }
  return () => unbind(bindings, property, execution);
}

/**
 *
 * @param {Record<string, Array<Function|Function[]>>} bindings
 * @param {string} property
 * @param {Function|Function[]} execution
 */
function unbind(bindings, property, execution) {
  const opts = { timeout: 20 };
  const b = bindings[property];
  if (b) {
    const idx = bindings[property].findIndex((fn) => fn === execution);
    if (idx >= 0) {
      b[idx] = NOOP;
      requestIdleCallback(
        () =>
          (bindings[property] = bindings[property].filter(
            (fn) => fn !== execution
          )),
        opts
      );
    }
  }
}
/**
 *
 * @param {any} scope
 * @param {Node} dom
 * @param {Record<string, Function[]>} [customBindings]
 *
 */
export function processDOM(scope, dom, customBindings = {}) {
  const walker = document.createTreeWalker(
    dom,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
  );
  /** @type {Function[]} */
  const unbinds = [];
  /** @type {Function[]} */
  const bounds = [];
  /** @type {Record<string, Function[]>} */
  const bindings = customBindings;
  /** @type {Node|null} */
  let currentNode = walker.currentNode || walker.nextNode();
  /** @type {Set<Attr>} */
  const pendingRemoval = new Set();
  const directives = Registry.getDirectives();
  for (; currentNode; currentNode = walker.nextNode()) {
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
        /** @type {HTMLElement} */ (currentNode).attributes
      );
      attributes.forEach((attr) => {
        const expression = (attr.nodeValue || '').trim();
        const userCode =
          expression.startsWith('{{') && expression.endsWith('}}')
            ? expression.slice(2, -2)
            : expression;
        const { paths } = expression.includes('{{')
          ? parse(userCode)
          : { paths: [] };
        directives.forEach((directive) => {
          if (directive.attribute(attr)) {
            pendingRemoval.add(attr);
            const { update: invocation, context: localContext } =
              directive.process({
                attribute: attr,
                bindings,
                context,
                expression: userCode,
                props: paths,
                scopeNode: scope,
                targetNode: /** @type {HTMLElement} */ (currentNode),
              });
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
              paths.forEach((path) =>
                unbinds.push(bind(scope, bindings, path, update))
              );
            }
          }
        });
      });
    } else if (currentNode.nodeType === Node.TEXT_NODE) {
      const context = /** @type {Text} */ (currentNode).parentElement?.[
        repeatContext
      ];
      const expression = currentNode.nodeValue || '';
      if (!expression.includes('{{')) continue;
      const { paths, expressions } = parse(expression);
      const oText = expression;
      const map = [...expressions, '{{item}}'].reduce(
        (/** @type {any} */ o, e) => {
          o[e] = new Function('item', `return ${e.slice(2, -2)}`);
          return o;
        },
        {}
      );
      const targetNode = /** @type {Text} */ (currentNode);
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
        unbinds.push(bind(scope, bindings, path, update))
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
        props.forEach((key) => (bindings[key] || []).forEach((fn) => fn()));
        // props.forEach(key => lazyQueue((bindings[key] || []), 50));
      } else {
        Object.values(bindings).forEach((chain) => chain.forEach((fn) => fn()));
        // Object.values(bindings).forEach(chain => lazyQueue(chain, 1));
      }
    },
    clear: () => lazyQueue(unbinds),
    bounds,
  };
}
