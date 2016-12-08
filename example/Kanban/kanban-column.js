;(function(){


    Slim('kanban-column', class extends SlimBaseElement {


        get template() {
            return `<div bind>[[data.name]]</div><kanban-item slim-repeat="myTasks"></kanban-item>`
        }

        onAdded() {
            console.log(this.myTasks)
        }

        get myTasks() {
            return this.model.getTasks(this.data.name)
        }


    })




})()