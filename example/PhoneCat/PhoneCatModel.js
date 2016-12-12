;(function() {


    class PhoneCatModel {

        constructor() {
            this.endpoint = 'https://cdn.rawgit.com/angular/angular-phonecat/master'
            this.phones = []
            this.load()
        }

        load() {
            fetch(this.endpoint + '/app/phones/phones.json')
                .then( response => {
                    return response.json()
                })
                .then( result => {
                    this.phones = result
                    this.onReady()
                })
        }
    }


    const instance = new PhoneCatModel();



    SlimInjector.define('PhoneCatModel', () => { return instance })




})()