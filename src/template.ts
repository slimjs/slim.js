import { parse } from './expression.js';
import { Directives } from './directive.js';
import { Utils } from './utils.js';
import { Internals } from './internals.js';
import { Slim } from './index.js';
const { Registry } = Directives;
const { debug, repeatCtx: repCtx, block, internals } = Internals;
const { lazyQueue, createFunction, NOOP, contextLookup } = Utils;

const walkerFilter = NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT;

type FlushOptions = {
  skip?: string[];
  keys?: string[];
};

type Bindings<K> = Utils.Bindings<K>;
type WithInternals<T, K> = Utils.WithInternals<T, K>;
type BindTarget = WithInternals<Node, Set<Function>>;
type BindSource = WithInternals<any, Set<BindTarget>>;
const bindMap: WeakMap<BindSource, Bindings<BindTarget>> = new WeakMap();

export function createBind(
  source: any,
  target: BindTarget,
  property: string,
  execution: Function
) {
  let propToTarget = (bindMap.get(source) ||
    bindMap.set(source, {}).get(source)) as Bindings<BindTarget>;
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

function runBinding(
  source: BindSource,
  property: string,
  value: any = source[property]
) {
  function runOneBind(
    meta: Bindings<BindTarget>,
    property: string,
    resolvedValue: any = value
  ) {
    (meta[property] || []).forEach((target) => {
      target[internals][property].forEach((fn: Function) => fn(target[repCtx] || resolvedValue));
    });
  }
  let propToTarget = (bindMap.get(source) ||
    bindMap.set(source, {}).get(source)) as Bindings<BindTarget>;
  if (property !== '*') {
    runOneBind(propToTarget, property);
  } else {
    Object.keys(propToTarget).forEach((key) =>
      runOneBind(propToTarget, key, source[key])
    );
  }
}

export function removeBindings(
  source: BindSource,
  target: BindTarget,
  property: string | '*'
) {
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
    let node: null | BindTarget = localWalker.currentNode as BindTarget;
    while (node) {
      meta.delete(node);
      node = localWalker.nextNode() as BindTarget | null;
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
  const forceUpdate = Utils.isForcedUpdate(scope);
  const walker = document.createTreeWalker(dom, walkerFilter);
  const unbinds = new Set<Function>();
  const bounds = new Set<Function>();
  let currentNode: BindTarget | null = (walker.currentNode ||
    walker.nextNode()) as BindTarget | null;
  /** @type {Set<Attr>} */
  const pendingRemoval = new Set<Attr>();
  const directives = Registry.getDirectives();
  for (; currentNode; currentNode = walker.nextNode() as BindTarget | null) {
    const currentNodeRef = currentNode;
    const context = () => contextLookup(currentNodeRef);

    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      if (
        currentNode.nodeName.includes('-') &&
        typeof currentNode[block] === 'undefined'
      ) {
        currentNode[block] = true;
      }
      if (currentNode[block] === 'abort') {
        continue;
      }
      const attributes = Array.from(
        (currentNode as BindTarget & HTMLElement).attributes
      );
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
              targetNode: currentNode as BindTarget & Element,
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
                  invocation(value, forceUpdate);
                } catch (err) {
                  console.warn(err);
                }
              };
              bounds.add(update);
              [...paths].forEach((path) => {
                unbinds.add(
                  createBind(scope, currentNode as BindTarget, path, update)
                );
              });
            }
          }
        }
      }
    } else if (currentNode.nodeType === Node.TEXT_NODE) {
      const expression = currentNode.nodeValue || '';
      if (!expression.includes('{{')) continue;
      let breakNode: Text | undefined = currentNode as unknown as Text;
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
        unbinds.add(createBind(scope, currentNode as BindTarget, path, update))
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
