+(function(){
    "use strict";

    const template = `

<div class="todo-wrapper">
    <p id="name"></p>
    <input type="button" id="rename" value="Rename"></input>
    <input type="button" id="done"></input>
    <input type="button" id="del" value="Delete"></span>
</div>
`

    document.registerElement('todo-item', class extends SlimBaseElement {

        get _renderOnAttributes() {
            return 'todo'
        }

        set todo (x) {
            this._todo = x
        }

        render() {
            if (!this._todo) return
            this.innerHTML = template;
            this.querySelector('#rename').onclick = () => {
                this._todo.name = window.prompt('New name?', this._todo.name)
                this.render()
            }
            this.querySelector('#done').value = this._todo.done ? 'Uncomplete' : 'Complete'
            this.querySelector('#name').innerText = this._todo.name
            if (this._todo.done) {
                this.querySelector('#name').innerText += ' (completed)'
            }
            this.querySelector('#del').onclick = () => {
                let event = new Event('deleteTodo', {composed: true, bubbles:true, value:this._todo})
                event.value = this._todo
                document.dispatchEvent(event)
            }
            this.querySelector('#done').onclick = () => {
                this._todo.done = !this._todo.done;
                let event = new Event('completeTodo', {composed: true, bubbles:true, value:this._todo})
                event.value = this._todo
                document.dispatchEvent(event)
                this._render()
            }
        }


    })


})()