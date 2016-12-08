+(function(){
    "use strict";



    class KanbanModel {

        constructor() {
            this.columns = [{name: 'Todo'},{name:'In-Progress'},{name:'Done'}]
            this.tasks = []
        }

        getIdForNewTask() {
            return this.tasks.length + 1;
        }

        getTasks(column) {
            return this.tasks.filter( task => {
                return task.column === column
            })
        }

        addTask(title = 'New Task', description = '') {
            let newTask = { title, description}
            newTask.column = 'Todo'
            newTask.id = this.getIdForNewTask()
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
