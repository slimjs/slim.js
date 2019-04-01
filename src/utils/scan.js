import { parse } from './expression.js'
import { watch } from 'oculusx'

/**
 *
 * @param {HTMLElement} source
 * @param {HTMLElement} target
 */
export const scan = (source, target) => {
  /**
   * @type {Text[]}
   */
  const textNodes = Array.from(target.childNodes).filter(n => n.nodeType === Node.TEXT_NODE)
  const masterNode = target
  textNodes.forEach(textNode => {
    const matches = textNode.nodeValue.match(/\{\{([^\}\}]+)+\}\}/g)
    if (matches) {
      const expressions = {}
      const sourceText = textNode.nodeValue
      const aggregate = () => {
        textNode.nodeValue = Object.entries(expressions).reduce((text, [path, value]) => {
          return text.split(path).join(value)
        }, sourceText)
      }
      matches.forEach(expression => {
        const [paths, execution] = parse(expression)
        if (paths.length > 1) {
          paths.forEach(path => {
            watch(source, path, () => {
              expressions[expression] = execution(source)
              aggregate()
            }, true)
          })
        } else {
          watch(source, paths[0], (value) => {
            expressions[expression] = value
            aggregate()
          }, true)
        }
      })
    }
  })
}