import { parse } from './expression.js';
import { Registry } from './directive.js';

/**
 * @typedef FlushOptions
 * @property {string[]} [skip]
 * @property {string[]} [keys]
 */

/**
 *
 * @param {any} any
 */
function extractContext(any) {
  if (typeof any === 'function') {
    return any();
  }
  return any;
}

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
  if (bindings[property]) {
    const idx = bindings[property].findIndex((fn) => fn === execution);
    if (idx >= 0) {
      Promise.resolve().then(
        () =>
          (bindings[property] = bindings[property].filter(
            (fn) => fn !== execution
          ))
      );
    }
  }
}

/**
 *
 * @param {any} scope
 * @param {Node} dom
 * @param {(target: Node) => any} [context]
 * @param {Record<string, Function[]>} [customBindings]
 *
 */
export function processDOM(
  scope,
  dom,
  context = undefined,
  customBindings = {}
) {
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
  /** @type {WeakSet<Attr>} */
  const noExecution = new WeakSet();
  const directives = Registry.getDirectives();
  for (; currentNode; currentNode = walker.nextNode()) {
    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const attributes = Array.from(
        /** @type {HTMLElement} */ (currentNode).attributes
      );
      attributes.forEach((attr) => {
        const expression = (attr.nodeValue || '').trim();
        const userCode =
          expression.startsWith('{{') && expression.endsWith('}}')
            ? expression.slice(2, -2)
            : expression;
        const { paths } = parse(userCode);
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
                : new Function(`return ${userCode}`);
              const update = (altContext = localContext) => {
                const value = fn.call(scope, extractContext(altContext));
                invocation(value);
              };
              bounds.push(update);
              paths.forEach((path) =>
                unbinds.push(bind(scope, bindings, path, update))
              );
              if (directive.noExecution) {
                noExecution.add(attr);
              }
            }
          }
        });
        if (
          !expression.startsWith('{{') ||
          !expression.endsWith('}}') ||
          noExecution.has(attr)
        ) {
          return;
        }
        if (expression) {
          const fn = new Function('item', `return ${userCode}`);
          const update = (altContext = context) => {
            attr.nodeValue = altContext
              ? String(fn.call(scope, extractContext(altContext)))
              : String(fn.call(scope));
          };
          bounds.push(update);
          paths.forEach((path) =>
            unbinds.push(bind(scope, bindings, path, update))
          );
          attr.nodeValue = '';
        }
      });
    } else if (currentNode.nodeType === Node.TEXT_NODE) {
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
        const text = Object.keys(map).reduce((text, current) => {
          try {
            const joinValue = altContext
              ? map[current].call(scope, extractContext(altContext))
              : map[current].call(scope);
            let resolvedValue =
              typeof joinValue === 'undefined' ? '' : joinValue;
            return text.split(current).join(resolvedValue);
          } catch (err) {
            return text.split(current).join('');
          }
        }, oText);
        targetNode.nodeValue = text;
      };
      bounds.push(update);
      paths.forEach((path) =>
        unbinds.push(bind(scope, bindings, path, update))
      );
    }
  }
  Promise.resolve().then(() => {
    Array.from(pendingRemoval).forEach(
      (attr) =>
        attr.ownerElement &&
        /** @type {Element} */ (attr.ownerElement).removeAttribute(
          attr.nodeName
        )
    );
  });
  return {
    /**
     *
     * @param {FlushOptions} [options]
     */
    flush: function (options = {}) {
      if (options.skip) {
        Object.keys(bindings)
          .filter((key) => !(options.skip || []).includes(key))
          .forEach((key) => {
            bindings[key].forEach((fn) => fn());
          });
      } else if (options.keys) {
        options.keys.forEach((key) =>
          (bindings[key] || []).forEach((fn) => fn())
        );
      } else {
        Object.values(bindings).forEach((chain) => chain.forEach((fn) => fn()));
      }
    },
    clear: function () {
      // @ts-ignore
      unbinds.forEach((fn) => requestIdleCallback(fn, { timeout: 20 }));
    },

    bounds,
  };
}
