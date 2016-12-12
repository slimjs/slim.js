+(function(doc) {
    "use strict";

    doc.registerElement('todo-task-item', class extends SlimBaseElement {

        get updateOnAttributes() {
            return ['name', 'done', 'todoid']
        }

        get template() {
            return `
<div id="container">
<span id="number" bind>[[data.todoId]]</span>
<input slim-id="checkbox" type="checkbox" done="[done]"/>
<span id="title" text="[name]" bind>[[data.name]]</span>
<input slim-id="delButton" type="button" value="X">
</div>`
        }

        afterRender () {
            super.update()
            var delButton = this.find('input[value="X"]')

            this.checkbox.dataItem = this.data
            if (this.data.done) {
                this.checkbox.setAttribute('checked', 'checked')
            } else {
                this.checkbox.removeAttribute('checked')
            }

            this.checkbox.onchange = () => {
                this.checkbox.dataItem.done = this.checkbox.checked
            }

            this.delButton.onclick = () => {
                this.checkbox.dataItem.delete()
            }
        }

    })

})(document)