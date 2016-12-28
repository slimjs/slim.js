Slim.tag('slim-ui-test', class extends Slim {

    testMouseover(e) {
        this.find('s-button').counter = this.find('s-button').counter || 0
        this.find('s-button').counter++
        this.find('s-button').setAttribute('text', `Hello ${ this.find('s-button').counter }`)
    }

    testFocus(e) {
        console.log(e)
    }

    testBlur(e) {
        console.log(e)
    }

    testClick(e) {
        this.myText = this.find('s-input').text || ''
        console.log(e)
    }

})




Slim.tag('editable-ui-test', class extends Slim {


    get template() {
        return '<div bind>Hello, [[myText]]</div><s-editable-input text="@myText"></s-editable-input>'
    }

    onCreated() {
        this.myText = 'Moshe Vilner'
        this.watch('myText', (e) => {
            console.log(e)
        })
    }




})