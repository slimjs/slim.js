import { Utils } from './utils.js';

const stripCurlies = /(\{\{([^\{|^\}]+)\}\})/gi;
const rx = /(this\.[\w+|\d*]*)+/gi;
const ix = /(item\.[\w+|\d*]*)+/gi;

type ParseResult = {
  paths: string[];
  expressions: string[];
}

function doParse(expression: string = '') {
  const paths: string[] = [];
  let match: RegExpExecArray | null = null;
  rx.lastIndex = ix.lastIndex = 0;
  while ((match = rx.exec(expression))) paths.push(match[1].split('.')[1]);
  while ((match = ix.exec(expression))) paths.push(match[1]);
  return {
    paths,
    expressions: paths.length ? expression.match(stripCurlies) || [] : [],
  };
}

export const parse = Utils.memoize<ParseResult>(doParse);