/**
 *
 * @param {string} rawExpression
 * @returns {[Array<string>, Function|undefined]}
 */
export const parse = rawExpression => {
  const matches = rawExpression.match(/\{\{(.+)\}\}/g) //rawExpression.match(/\{\{([^\}\}]+)+\}\}/g)
  if (matches) {
    let paths, execute
    const expression = matches[0].slice(2, -2)
    const rxM = /(?<method>.+)(\((?<args>.+)\))/.exec(expression)
    if (rxM && rxM.groups) {
      paths = rxM.groups.args
        .split('this.').join('')
        .split(',').map(x => x.trim())
      const execNaive = new Function('return ' + expression + ';')
      const execWith = new Function('with (this) { return ' + expression + ' }')
      execute = thisArg => {
        try {
          return execNaive.call(thisArg)
        } catch (err) {
          try {
            return execWith.call(thisArg)
          } catch (err) {}
        }
      }
      return [paths, execute]
    }
    const rxP = /(?<path>\S+)+/.exec(expression)
    if (rxP && rxP.groups) {
      const execWith = new Function('with (this) { return ' + expression + ' }')
      return [[rxP.groups.path], execWith]
    }
    console.log(expression)
  } else {
    return [[], undefined]
  }
}