+(function($) {
    "use strict";

    class TodoModel {

        constructor() {
            this.todos = []
        }

        create(title = 'New Task') {
            return {
                name: title,
                done: false
            }
        }

        add(todo = undefined) {
            this.todos.push(todo || this.create())
            return todo
        }

        deleteTodo(todo) {
            let i = this.todos.indexOf(todo)
            if (i >= 0) {
                this.todos.splice(i, 1)
            }
        }
    }

    var model = new TodoModel();

    function getModel() {
        return model;
    }

    $.define('todo-app', getModel)
    $.define('todo-summary', getModel)

})(document.SlimInjector)