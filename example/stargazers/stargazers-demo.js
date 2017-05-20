Slim.tag('stargazers-demo',

    `<h1 bind>[[repoName]] Stargazers!</h1>
    <div>
        <input slim-id="myInput" type="text" placeholder="user/repo" />
        <button click="search">Search...</button>
        <hr/>
        <button click="makeBig">256x256</button>
        <button click="makeSmall">128x128</button>
    </div>
    <div slim-if="isLoading">Loading...</div>
    <div slim-if="!isLoading" id="results">
        <stargazer-item handle-select="handleSelect" size="[[avatarSize]]" slim-repeat="stargazers"></stargazer-item>
    </div>
    
    <style bind>
        #results {
            display: flex;
            flex-direction: row;
        }
    </style>
`,

    class extends Slim {
        get useShadow() { return true; }

        onBeforeCreated() {
            window.unit = this;
            this.repoName = 'eavichay/slim.js';
            this.stargazers = [];
            this._avatarSize = 128;
            this.isLoading = false;
        }

        get avatarSize() { return this._avatarSize; }
        set avatarSize(value) {
            // console.log('Changing avatar size to ' + value);
            this._avatarSize = value;
        }

        makeBig() {
            console.time('makeBig');
            this.avatarSize = 256;
            console.timeEnd('makeBig');
        }

        makeSmall() {
            console.time('makeSmall');
            this.avatarSize = 128;
            console.timeEnd('makeSmall');
        }

        onCreated() {
            this.runQuery();
        }

        handleSelect(data) {
            alert(data.html_url);
        }

        search() {
            this.repoName = this.myInput.value;
            this.stargazers = [];
            this.runQuery();
        }

        runQuery() {
            this.isLoading = true;
            fetch(`https://api.github.com/repos/${this.repoName}/stargazers?page=1&per_page=100`)
                .then(response => response.json() )
                .then(stargazers => {
                    this.stargazers = stargazers;
                    this.isLoading = false;
                });
        }
});