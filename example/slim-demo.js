+(function() {
    "use strict";

    const template =
`<div id="youtube"><h1>Youtube (music???) player demo using SlimJS</h1>
<span>Enter video id</span><input id="vidid" type="text" value="[videoId]"></input><input id="launch" type="button" value="Play"></input>
<span>Width</span><input id="vw" type="number" step="10" value="[vWidth]">
<span>Height</span><input id="vh" type="number" step="10" value="[vHeight]">
<div>
<slim-yt-player video-id="[videoId]" width="[vWidth]" height="[vHeight]"></slim-yt-player>
</div></div>
`

    document.registerElement('slim-demo', class extends SlimBaseElement {


        get template() {
            return template
        }

        onCreated() {
            this.videoId = 'BcPGz2gVHb4'
            this.vWidth = 0
            this.vHeight = 0
        }

        updatePlayer() {
            let yt = this.find('slim-yt-player')
            yt.setAttribute('video-id', this.find('input#vidid').value)
        }

        render() {
            this.find
            this.find('input#vidid').oninput =
            this.find('input#launch').onclick = () => {
                this.updatePlayer()
            }

            this.find('#vw').onchange =
            this.find('#vh').onchange = () => {
                this.vWidth = this.find('#vw').value
                this.vHeight = this.find('#vh').value
            }
        }




    })

}())