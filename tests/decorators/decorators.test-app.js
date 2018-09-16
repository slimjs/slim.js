// import {Slim} from "../../Slim";
// import {tag, template, attribute} from "../../Decorators";

@tag('test-app')
@template(`
<h1>{{myProp}}</h1>
`)
class TestApp extends Slim {

    @attribute()
    myProp = '';
}