  +(function() {

        Slim('s-repeat', class SlimRepeat extends SlimBaseElement {

            afterRender() {
                this.update()
            }

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
                for (let dataItem of this.sourceData) {
                    for (let child of this.__bindingTree.children) {
                        let node = document.importNode(child, false)
                        node.data = dataItem
                        for (let prop in dataItem) {
                            node[prop] = dataItem[prop]
                            if (!(typeof dataItem[prop] === "function") && !(typeof dataItem[prop] === "object")) {
                                node.setAttribute(prop, dataItem[prop])
                            }
                        }
                        this.appendChild(node)
                        node.update()
                    }
                }
            }
        })
    })()