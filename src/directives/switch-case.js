/**
 @license
 Copyright (c) 2018 Eyal Avichay <eavichay@gmail.com>

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
import { Slim } from '../Slim.js'

Slim.customDirective(
  attr => attr.nodeName === 's:switch',

  /**
   *
   * @param {HTMLElement|Object} source
   * @param {HTMLElement|Object} target
   * @param {Object} attribute
   */
  (source, target, attribute) => {
    const expression = attribute.value
    let oldValue
    const anchor = document.createComment(`switch:${expression}`)
    target.appendChild(anchor)
    const children = [...target.children]
    const defaultChildren = children.filter(child =>
      child.hasAttribute('s:default')
    )
    const fn = () => {
      let value = Slim.lookup(source, expression, target)
      if (String(value) === oldValue) return
      let useDefault = true
      children.forEach(child => {
        if (child.getAttribute('s:case') === String(value)) {
          if (child.__isSlim) {
            child.createdCallback()
          }
          anchor.parentNode.insertBefore(child, anchor)
          useDefault = false
        } else {
          Slim.removeChild(child)
        }
      })
      if (useDefault) {
        defaultChildren.forEach(child => {
          if (child.__isSlim) {
            child.createdCallback()
          }
          anchor.parentNode.insertBefore(child, anchor)
        })
      } else {
        defaultChildren.forEach(child => {
          Slim.removeChild(child)
        })
      }
      oldValue = String(value)
    }
    Slim.bind(source, target, expression, fn)
  }
)

Slim.customDirective(attr => /^s:case$/.exec(attr.nodeName), () => {}, true)
Slim.customDirective(
  attr => /^s:default$/.exec(attr.nodeName),
  () => {},
  true
)
