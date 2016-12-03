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
<input type="checkbox" done="[done]"/>
<span id="title" text="[name]" bind>[[data.name]]</span>
<input type="button" value="X">
</div>`
        }

        update () {
            super.update()
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