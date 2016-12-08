  +(function() {

        Slim('s-repeat', class SlimRepeat extends SlimBaseElement {

            get sourceData() {
                try {
                    return this.parentBind[this.getAttribute('source')]
                }
                catch (err) {
                    return []
                }
            }

            _renderCycle() {
                super._renderCycle(true)
            }

            update() {
                this.innerHTML = ''
                let childrenToAdd = []
                for (let dataItem of this.sourceData) {
                    for (let child of this.__bindingTree.children) {
                        let node = child.cloneNode(true)
                        node.parentBind = node
                        node.data = dataItem
                        if (!node.parentBind) {
                                node.parentBind = node
                        }
                        for (let prop in dataItem) {
                            node[prop] = dataItem[prop]
                            if (!(typeof dataItem[prop] === "function") && !(typeof dataItem[prop] === "object")) {
                                node.setAttribute(prop, dataItem[prop])
                            }
                        }
                        if (node.isSlim) {
                                node.createdCallback(true)
                        } else {
                                this._applyTextBindings.bind(node)()
                        }
                        childrenToAdd.push(node)
                    }
                }
                for (let child of childrenToAdd) {
                    this.appendChild(child)
                }
            }
        })
    })()