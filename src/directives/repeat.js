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

(function () {
  const _$ = Symbol.Slim
  const { isReadOnly } = Slim

  Slim.customDirective(
    attr => attr.nodeName === 's:repeat',
    (source, repeaterNode, attribute) => {
      let path = attribute.value
      let tProp = 'data' // default
      if (path.indexOf(' as ') > 0) {
        [path, tProp] = path.split(' as ')
      }

      // initialize clones list
      let clones = []

      // create mount point and repeat template
      const mountPoint = document.createComment(`${repeaterNode.localName} s:repeat="${attribute.value}"`)
      const parent = repeaterNode.parentElement || Slim.root(source)
      parent.insertBefore(mountPoint, repeaterNode)
      repeaterNode.removeAttribute('s:repeat')
      Slim.qSelectAll(repeaterNode, '*').forEach(node => {
        Slim._$(node).excluded = true
      })
      Slim._$(repeaterNode).excluded = true
      const clonesTemplate = repeaterNode.outerHTML
      repeaterNode.remove()

      // prepare for bind
      let oldDataSource = []

      const replicate = (n, text) => {
        let temp = text
        let result = ''
        if (n < 1) return result
        while (n > 1) {
          if (n & 1) result += temp
          n >>= 1
          temp += temp
        }
        return result + temp
      }

      // bind changes
      Slim.bind(source, mountPoint, path, () => {
        // execute bindings here
        const dataSource = Slim.lookup(source, path) || []
        // read the diff -> list of CHANGED indicies

        let fragment

        // when data source shrinks, dispose extra clones
        if (dataSource.length < clones.length) {
          const disposables = clones.slice(dataSource.length)
          disposables.forEach(node => {
            Slim.unbind(source, node)
            if (node[_$].subTree) {
              node[_$].subTree.forEach(subNode => Slim.unbind(source, subNode))
            }
            node.remove()
          })
          clones.length = dataSource.length
        }

        // build new clones if needed
        if (dataSource.length > clones.length) {
          const offset = clones.length
          const diff = dataSource.length - clones.length
          const html = replicate(diff, clonesTemplate)
          const range = document.createRange()
          range.setStartBefore(mountPoint)
          fragment = range.createContextualFragment(html)
          // build clone by index
          for (let i = 0; i < diff; i++) {
            const dataIndex = i + offset
            const dataItem = dataSource[dataIndex]
            const clone = fragment.children[i]
            Slim._$(clone).repeater[tProp] = dataItem
            const subTree = Slim.qSelectAll(clone, '*')
            subTree.forEach(function (node) {
              Slim._$(node).repeater[tProp] = dataItem
            })
            clone[_$].subTree = subTree
            clones.push(clone)
          }
          const fragmentTree = Slim.qSelectAll(fragment, '*')
          source._bindChildren(fragmentTree)
        }

        const init = (target, value) => {
          if (!isReadOnly(target, tProp)) {
            target[tProp] = value
          }
          Slim.commit(target, tProp)
        }

        dataSource.forEach(function (dataItem, i) {
          if (oldDataSource[i] !== dataItem) {
            const rootNode = clones[i]
            ;[rootNode, ...(rootNode[_$].subTree || Slim.qSelectAll(rootNode, '*'))].forEach(node => {
              node[_$].repeater[tProp] = dataItem
              node[_$].repeater.__node = rootNode
              if (node.__isSlim) {
                node.createdCallback()
                Slim.asap(() => init(node, dataItem))
              } else {
                init(node, dataItem)
              }
            })
          }
        })
        oldDataSource = dataSource.concat()
        if (fragment) {
          Slim.asap(() => {
            parent.insertBefore(fragment, mountPoint)
          })
        }
      })
    },
    true
  )
})()
