+(function(doc) {
    "use strict";


    doc.registerElement('todo-task-list', class extends SlimBaseElement {


        get template() {
            return `<s-repeat source="items"><todo-task-item></todo-task-item></s-repeat>`
        }

        get model() {
            return this._model
        }

        set model(model) {
            if (model === this._model) return
            this._model = model
            this.items = this._model.todos
            this._model.addEventListener('change', () => {
                this.find('s-repeat').update()
            })
            this.find('s-repeat').update()
        }



    })

})(document)