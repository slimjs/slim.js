Slim('repeated-item', class extends SlimBaseElement {


    get template() {
        return `<div bind>[[data.label]] ::::: [[data.value]]</div>`
    }


})