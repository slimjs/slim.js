Slim.tag('stargazers-demo',

    `<h1 bind>[[repoName]] Stargazers!</h1>
    <div>
        <input slim-id="myInput" type="text" placeholder="user/repo" />
        <button click="search">Search...</button>
    </div>
    <div id="results">
        <stargazer-item handle-select="handleSelect" size="128" slim-repeat="stargazers"></stargazer-item>
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
            this.repoName = 'eavichay/slim.js';
            this.stargazers = [];
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
            fetch(`https://api.github.com/repos/${this.repoName}/stargazers?page=1&per_page=100`)
                .then(response => response.json() )
                .then(stargazers => {
                    this.stargazers = stargazers;
                });
        }
});