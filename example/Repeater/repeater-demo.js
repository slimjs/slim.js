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
            { label: 'item 2', value: 'value 2'},
            { label: 'item 3', value: 'value 3'},
            { label: 'item 4', value: 'value 4'},
            { label: 'item 5', value: 'value 5'},
            { label: 'item 6', value: 'value 6'}
        ]
    }
    
    
})