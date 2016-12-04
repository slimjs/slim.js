+(function(){
    "use strict";



    class KanbanModel {


        get lists() {
            if (!this._lists) {
                this._lists = {}
            }
            return this._lists
        }

        addList(name = 'new list') {
            var self = this
            this.lists[name] = {
                name: name,
                items: [],
                deleteList: function() {
                    delete self.lists[this.name]
                },
                createItem: function(name = 'new task') {
                    let newItem = {
                        name: name,
                        description: ''
                    }
                    this.items.push(newItem)
                    return newItem
                }
            }
        }
    }


    const instance = new KanbanModel()


    instance.addList('list 1')
    instance.addList('list 2')
    instance.addList('list 3')

    instance.lists['list 1'].createItem('new task 1')


    SlimInjector.define("KanbanModel", function() {
        return instance;
    })





})()
