import { memoize } from './utils.js';

const stripCurlies = /(\{\{([^\{|^\}]+)\}\})/gi;
const rx = /(this\.[\w+|\d*]*)+/gi;
const ix = /(item\.[\w+|\d*]*)+/gi;

/**
 * @typedef ParseResult
 * @property {string[]} paths
 * @property {string[]} expressions
 */

function doParse(expression = '') {
  const paths = [];
  let match = null;
  rx.lastIndex = ix.lastIndex = 0;
  while ((match = rx.exec(expression))) paths.push(match[1].split('.')[1]);
  while ((match = ix.exec(expression))) paths.push(match[1]);
  return {
    paths,
    expressions: paths.length ? expression.match(stripCurlies) || [] : [],
  };
}

export const parse = memoize(doParse);