+(function(){
    "use strict";

    const template = `

<h1>My Todos</h1>
<todo-summary></todo-summary>
<input type="button" id="add1" value="+ Add todo" />
<hr/>
<x-repeat source="items">
<xtodo-item></todo-item>
<hr/>
</x-repeat>
<hr/>
<input type="button" id="add2" value="+ Add todo" />
<span id="summary"></span>
`

    document.registerElement('todo-app', class extends SlimBaseElement {

        get template() {
            return template
        }

        set $dependency(model) {
            this.model = model
        }

        get items() {
            return this.model.todos.map( (todo) => {
                return { todo: todo }
            })
        }

        onAdded() {
            super.onAdded()
            document.addEventListener('deleteTodo', (event) => {
                this.model.deleteTodo(event.value)
                this.render()
            })
            document.addEventListener('completeTodo', (event) => {
                this.render()
            })
            this._render()
        }

        render() {
            super.render()
            this.querySelector('#add1').onclick = () => {
                this.model.add(this.model.create(window.prompt('What do you need to do?', 'New Task')))
                this._render()
            }
            this.querySelector('#add2').onclick = this.querySelector('#add1').onclick
//             this.querySelector('#summary').innerText = `Total ${this.items.length} items`

//             this.find('todo-summary').render()
        }


    })

})()