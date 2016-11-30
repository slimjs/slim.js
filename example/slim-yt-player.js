+(function() {
    "use strict";


    document.registerElement('slim-yt-player', class extends SlimBaseElement {

        get _renderOnAttributes() {
            return ['video-id']
        }

        get template() {
            return `<iframe width=720" height="480" src="https://www.youtube.com/embed/$VID_ID?autoplay=1"></iframe>`
        }

        onAdded() {
            this._render()
        }

        render() {
            this.innerHTML = this.template.replace('$VID_ID', this.getAttribute('video-id'));
        }


    })

}())