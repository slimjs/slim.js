+(function(){
    "use strict";



    class KanbanModel {

        constructor() {
            this.lists = ['Todo', 'In-Progress', 'Done']
            this.tasks = []
        }

        getTasks(column) {
            return tasks.filter( task => {
                return task.column === column
            })
        }

        addTask(name = 'New Task', description = '') {
            let newTask = { name, description}
            newTask.column = 'Todo'
            this.tasks.push(newTask)
        }

        get hello() {
            return 'Hello'
        }


    }


    const instance = new KanbanModel()

    for (let x = 0; x < 10; x++) {
        instance.addTask(`Task ${x+1}`, `this is task number ${x+1}`)
    }


    SlimInjector.define("KanbanModel", function() {
        return instance;
    })





})()
