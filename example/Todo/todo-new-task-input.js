+(function() {
    "use strict";


    document.registerElement('todo-new-task-input', class extends SlimBaseElement {

        get template() {
            return `<input type="text" placeholder="New Task..."/>`
        }

        submitNewTask(value) {
            this.model.addTask(value)
            this.find('input').value = ''
        }

        _renderCycle() {
            super._renderCycle()
        }

        afterRender() {
            this.find('input').onkeydown = (event) => {
                if (event.keyCode === 13) {
                    this.submitNewTask(event.target.value)
                }
            }
        }


    })

})()