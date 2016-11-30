+(function() {
    "use strict";


    document.registerElement('slim-yt-player', class extends SlimBaseElement {

        get _renderOnAttributes() {
            return ['video-id']
        }

        get template() {
            return `<div id="container"><iframe frameborder="0" width="100%" height="100%" src="[getURL(videoId)]"></iframe></div>`
        }

        set width(x) {
            this._width = x
            this.find('#container').style.width = x + 'px'
        }

        set height(x) {
            this._height = x
            this.find('#container').style.height = x + 'px'
        }

        getURL() {
           return `https://www.youtube.com/embed/${this['video-id']}?autoplay=1`
        }

        onAdded() {
            this.height = 0
            this.width = 0
        }


    })

}())