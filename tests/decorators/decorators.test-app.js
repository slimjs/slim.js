// import {Slim} from "../../Slim";
// import {tag, template, attribute} from "../../Decorators";

@tag('test-app')
@template(`
<h1 bind>{{myProp}}</h1>
`)
class TestApp extends Slim {

    @attribute()
    myProp = '';
}