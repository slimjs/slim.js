
Slim.tag('stargazer-item',

    `
<h1 bind click="handleClick">[[data.login]]</h1>

<style bind>
    :host {
        background-image: url('[[data.avatar_url]]');
        background-size: cover;
        position: relative;
        display: inline-flex;
        flex-direction: column;
        width: [[size]]px;
        height: [[size]]px;
        border: 1px solid black;
        overflow: hidden;
        margin: 0;
        padding: 0;
        border-radius: 1em;
    }
   
    h1 {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: rgba(0,0,0,0.8);
        color: white;
        font-size: 14px;
        font-family: monospace;
        cursor: pointer;
    }

    h1::before {
        content: '[[data_index]] ';
    }
</style>
`,

    class extends Slim {
        get useShadow() { return true; }

        handleClick() {
            this.callAttribute('handle-select', this.data);
        }
    });