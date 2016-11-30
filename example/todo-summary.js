+(function () {

    const template = '<p>You have completed $COMPLETED out of your $TOTAL tasks</p>'

    document.registerElement('todo-summary', class extends SlimBaseElement {

        set $dependency(model) {
            this.model = model
        }

        count() {
            return this.model.todos.reduce( (ctx, todo) => {
                ctx.count++
                if (todo.done) {
                    ctx.completed++
                }
                return ctx
            }, {count: 0, completed: 0})
        }

        render() {
            var count = this.count()
            this.innerHTML = template.split('$COMPLETED').join(count.completed.toString())
                .split('$TOTAL').join(count.count.toString())
        }

    })

})()