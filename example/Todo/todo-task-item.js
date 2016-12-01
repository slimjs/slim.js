+(function(doc) {
    "use strict";

    doc.registerElement('todo-task-item', class extends SlimBaseElement {

        get _renderOnAttributes() {
            return ['name', 'done', 'todoid']
        }

        get template() {
            return `
<div id="container">
<span id="number">$NUM</span>
<input type="checkbox" done="[done]"/>
<span id="title" text="[name]">$NAME</span>
<input type="button" value="X">
</div>`
        }

        set data(value) {
            this._dataItem = value
        }

        get data() {
            return this._dataItem
        }

        update () {
            this.innerHTML = this.innerHTML
                .split('$NAME').join(this.data.name)
                .split('$NUM').join(this.data.todoId)

            var checkbox = this.find('input[type=checkbox]')
            var delButton = this.find('input[value="X"]')

            checkbox.dataItem = this.data
            if (this.data.done) {
                checkbox.setAttribute('checked', 'checked')
            } else {
                checkbox.removeAttribute('checked')
            }

            checkbox.onchange = () => {
                checkbox.dataItem.done = checkbox.checked
            }

            delButton.onclick = () => {
                checkbox.dataItem.delete()
            }
        }

    })

})(document)