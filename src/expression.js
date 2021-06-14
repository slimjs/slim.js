const stripCurlies = /(\{\{([^\{|^\}]+)\}\})/gi;
const rx = /(this\.[\w+|\d*]*)+/gi;
const ix = /(item\.[\w+|\d*]*)+/gi;

/**
 * @param {string} expression
 * @returns {{paths: string[], expressions: string[]}}
 */
export function parse(/** @type {string} */ expression) {
  /** @type {string[]} */
  const paths = [];
  /** @type {RegExpExecArray | null} */
  let match;
  rx.lastIndex = 0;
  ix.lastIndex = 0;
  while ((match = rx.exec(expression))) paths.push(match[1].split('.')[1]);
  while ((match = ix.exec(expression))) paths.push(match[1].split('.')[1]);

  return {
    paths,
    expressions: paths.length ? expression.match(stripCurlies) || [] : [],
  };
}
