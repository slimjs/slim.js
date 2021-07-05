import { parse } from './expression.js';
import { DirectiveRegistry } from './enhance.js';
import {
  isForcedUpdate,
  lazyQueue,
  createFunction,
  NOOP,
  findCtx,
  memoize,
} from './utils.js';
import { repeatCtx, block, internals, debug } from './internals.js';
import Slim from './component.js';

const emptyArray = [];
const emptyObject = {};
const ABORT = 'abort';
const cons = console;
const logError = (title, message, ...info) =>
  Slim[debug] &&
  (cons.group(title), cons.error(message), cons.info(...info), cons.groupEnd());
const expressionToJS = memoize(
  (str) => '`' + str.replaceAll('{{', '${').replaceAll('}}', '}') + '`'
);
const walkerFilter = NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT;
const createWalker = (target) =>
  document.createTreeWalker(target, walkerFilter);

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
    const oSet = (
      Object.getOwnPropertyDescriptor(source, property) || emptyObject
    ).set;
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
  (meta[property] || emptyArray).forEach((target) => {
    const value = target[repeatCtx] || resolvedValue;
    target[internals][property].forEach((fn) => fn(value));
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

export const removeBindings = (source, target, property = '*') => {
  let propToTarget = bindMap.get(source) || emptyObject;
  if (property === '*') {
    Object.keys(propToTarget).forEach((key) =>
      removeBindings(source, target, key)
    );
    return;
  }
  let meta = propToTarget[property];
  if (meta) {
    const localWalker = createWalker(target);
    /** @type {Node|null} */
    let node = localWalker.currentNode;
    while (node) {
      meta.delete(node);
      node = localWalker.nextNode();
    }
  }
};

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

  const walker = createWalker(dom);
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
          expression.slice(0, 2) === '{{' && expression.slice(-2) === '}}'
            ? expression.slice(2, -2)
            : expression;
        /** @type {string[]} */
        const paths = ~expression.indexOf('{{')
          ? parse(userCode).paths
          : emptyArray;
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
                  logError(
                    `Directive Error ${attrName}`,
                    err.message,
                    `Expression: ${userCode}`,
                    'Node',
                    targetNode
                  );
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
      const expression = /** @type string **/ (currentNode.textContent);
      if (!~expression.indexOf('{{')) continue;
      const targetNode /** @type {Text} */ = /** @type {unknown} */ currentNode;
      const { paths: oPaths } = parse(expression);
      const raw = expressionToJS(expression);
      const fn = createFunction('item', `return ${raw}`);
      const oUpdate = (altContext = defaultContext()) => {
        try {
          targetNode.nodeValue = fn.call(scope, altContext);
        } catch (err) {
          logError(
            `Expression error: ${expression}`,
            err.message,
            'Node',
            targetNode.parentElement
          );
        }
      };
      bounds.add(oUpdate);
      oPaths.forEach((path) =>
        unbinds.add(createBind(scope, currentNode, path, oUpdate))
      );
    }
  }
  pendingNodesToRemove.forEach((e) => e.remove());
  if (!Slim[debug]) {
    pendingAttributesToRemove.forEach((attr) => {
      try {
        /** @type {Element} */ (attr.ownerElement).removeAttribute(
          attr.nodeName
        );
      } catch (e) {}
    });
  }
  return {
    /**
     * @param {...string} props
     */
    flush: (...props) => {
      if (props.length) {
        props.forEach((key) => runBinding(scope, key));
      } else {
        runBinding(scope, '*');
      }
    },
    clear: () => lazyQueue(unbinds),
    bounds,
  };
};
