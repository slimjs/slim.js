+(function(doc) {
    "use strict";


    doc.registerElement('todo-task-list', class extends SlimBaseElement {

        get updateOnAttributes() {
            return ['model']
        }


        get template() {
            return `<s-repeat source="items"><todo-task-item></todo-task-item></s-repeat>`
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