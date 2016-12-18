Slim.tag('tree-list', class extends Slim {




    get template() {
        if (this.data instanceof Array) {
            return '<span>---</span><tree-list slim-repeat="data"></tree-list>>'
        } else {
            return '<div><span bind>Text: [[data]]</span></div>'
        }
    }

})