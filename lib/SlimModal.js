+(function() {
    "use strict";

        const template = `
<div class="overlay" style="
    display: flex;
    z-index: 100;
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    flex-direction: row;
    align-content: space-around;
    background: rgba(0,0,0,0.75);
    align-items: center;">
    <div class="modal" style="
        display: flex;
        flex-direction: column;
        align-content: center;
        align-items: center;
        border: 1px solid white;
        margin: 0 auto;
        padding: 3em;
        border-radius: 1em;">
        <h1 class="modal-title">Title goes here</h1>
        <content></content>
    </div>
</div>`

        document.registerElement('slim-modal', class extends SlimBaseElement {


            attachDOM(node) {
                this.content = node
                this._render()
            }

            show() {
                document.body.appendChild(this)
            }

            hide() {
                document.body.removeChild(this)
            }


            render() {
                this.innerHTML = template
                if (this.content) {
                    this.find('content').appendChild(this.content)
                }
            }

        })

    }
)()