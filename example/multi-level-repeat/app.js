
Slim.tag('file-item',
`<li><span bind>Filename: [[file]]</span><a href="[[generateLink(file, library)]]" bind>[[generateLink(file, library)]]</a></li>`,
class extends Slim {
    get useShadow() { return true; }
    generateLink(data, library) {
        return 'https://cdnjs.cloudfare.com/ajax/libs/' + library + '/' +
            this.version + '/' + data;
    }
});

Slim.tag('lib-asset',`
<h2 bind>Version: [[asset.version]]</h2>
<ul>
    <file-item bind library="[[libraryName]]" version="[[asset.version]]" slim-repeat="asset.files" slim-repeat-as="file"></file-item>
</ul>
`,
class LibAsset extends Slim {
    get useShadow() { return true; }
}
);


Slim.tag('lib-browser',`
<h1 bind>[[libraryData.name]]</h1>
<lib-asset library-name="[[libraryData.name]]" slim-repeat="libraryData.assets" slim-repeat-as="asset"></lib-asset>
`, class LibBrowser extends Slim {
    get useShadow() { return true; }
    onBeforeCreated() {
        this.libraryName = 'slim.js';
        this.libraryData = {};
        this.getData();
    }

    getData() {
        fetch('https://api.cdnjs.com/libraries/' + this.libraryName)
            .then(r => r.json())
            .then( data => {
                console.time('render');
                this.libraryData = data;
                console.timeEnd('render');
            });
    }
});