Slim('repeater-demo', class extends SlimBaseElement {


    get template() {
        return `<span slim-repeat="items" bind>Primitive [[data.label]] -- [[data.value]]</span>
<br/>
<hr/>
<repeated-item slim-repeat="items"></repeated-item>`
    }
    
    get items() {
        return [
            { label: 'item 1', value: 'value 1'},
            { label: 'item 2', value: 'value 2'}
        ]
    }
    
    
})