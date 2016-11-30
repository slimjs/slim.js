+(function() {

    class TodoModel {

        constructor() {
            var delegate = document.createDocumentFragment();
            ['addEventListener', 'dispatchEvent', 'removeEventListener'].forEach(
                f => this[f] = (...xs) => delegate[f](...xs)
            )
            this.todos = []
        }

        addTask(value) {
            this.todos.push( {
                name: value,
                done: false,
                todoId: this.todos.length + 1,
                delete: function() {
                    instance.removeTask(this.todoId)
                }
            })

            this.dispatchEvent(new Event('change'))
        }

        removeTask(taskId) {
            this.todos.splice(taskId - 1, 1)
            this.todos.forEach( (todo, index) => {
                todo.todoId = index + 1
            })
            this.dispatchEvent(new Event('change'))
        }

    }

    const instance = new TodoModel()

    instance.addTask('Get SlimJS')
    instance.addTask('Learn how to work with it in 5 minutes')
    instance.addTask('Throw away all the libraries')
    instance.addTask('Enjoy building apps')

    SlimInjector.define('model', function() {
        "use strict";
        return instance
    })



})()