const stripCurlies = /(\{\{([^\{|^\}]+)\}\})/gi;
const rx = /(this\.[\w+|\d*]*)+/gi;
const ix = /(item\.[\w+|\d*]*)+/gi;

const cache = {};

/**
 * @param {string} expression
 * @returns {{paths: string[], expressions: string[]}}
 */
export function parse(/** @type {string} */ expression) {
  return cache[expression] || memoizedParse(expression);
}

/**
 * @param {string} expression
 * @returns {{paths: string[], expressions: string[]}}
 */
export function memoizedParse(/** @type {string} */ expression) {
  return (
    cache[expression] ||
    (function () {
      /** @type {string[]} */
      const paths = [];
      /** @type {RegExpExecArray | null} */
      let match;
      rx.lastIndex = 0;
      while ((match = rx.exec(expression))) paths.push(match[1].split('.')[1]);
      while ((match = ix.exec(expression))) paths.push(match[1]);

      const result = {
        paths,
        expressions: paths.length ? expression.match(stripCurlies) || [] : [],
      };
      cache[expression] = result;
      return result;
    })()
  );
}
