+(function(doc) {
    "use strict";


    doc.registerElement('todo-task-list', class extends SlimBaseElement {

        get updateOnAttributes() {
            return ['model']
        }


        get template() {
            return `<todo-task-item slim-repeat="items"></todo-task-item>`
        }

        get items() {
            return this.model.todos
        }

        afterRender() {
            this.model.addEventListener('change', () => {
                this.find('s-repeat').update()
            })
            this.find('s-repeat').update()
        }



    })

})(document)