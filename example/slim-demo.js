+(function() {
    "use strict";

    const template =
`<h1>Youtube player demo using SlimJS</h1>
<span>Enter video id</span><input id="vidid" type="text"></input><input id="launch" type="button" value="Play"></input>
<div>
<slim-yt-player video-id="[videoId]"></slim-yt-player>
</div>`

    document.registerElement('slim-demo', class extends SlimBaseElement {


        get template() {
            return template
        }

        updatePlayer() {
            this
                .find('slim-yt-player')
                .setAttribute('video-id', this.find('input#vidid').value)
        }

        render() {
            this.find('input#vidid').oninput =
            this.find('input#launch').onclick = () => {
                this.updatePlayer()
            }
        }




    })

}())