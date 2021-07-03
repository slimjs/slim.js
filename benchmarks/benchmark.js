import { Slim } from '../src/index.js';
import '../src/directives/repeat.directive.js';
import '../src/directives/attribute.directive.js';
import '../src/directives/event.directive.js';

function _random(max) {
  return Math.round(Math.random() * 1000) % max;
}

const store = {
  data: [],
  backup: null,
  selected: null,
  id: 1,
  buildData(count = 1000) {
    var adjectives = [
      'pretty',
      'large',
      'big',
      'small',
      'tall',
      'short',
      'long',
      'handsome',
      'plain',
      'quaint',
      'clean',
      'elegant',
      'easy',
      'angry',
      'crazy',
      'helpful',
      'mushy',
      'odd',
      'unsightly',
      'adorable',
      'important',
      'inexpensive',
      'cheap',
      'expensive',
      'fancy',
    ];
    var colours = [
      'red',
      'yellow',
      'blue',
      'green',
      'pink',
      'brown',
      'purple',
      'brown',
      'white',
      'black',
      'orange',
    ];
    var nouns = [
      'table',
      'chair',
      'house',
      'bbq',
      'desk',
      'car',
      'pony',
      'cookie',
      'sandwich',
      'burger',
      'pizza',
      'mouse',
      'keyboard',
    ];
    var data = [];
    for (var i = 0; i < count; i++)
      data.push({
        id: this.id++,
        label:
          adjectives[_random(adjectives.length)] +
          ' ' +
          colours[_random(colours.length)] +
          ' ' +
          nouns[_random(nouns.length)],
      });
    return data;
  },
  updateData(mod = 10) {
    for (let i = 0; i < this.data.length; i += 10) {
      // this.data[i].label += ' !!!';
      this.data[i] = Object.assign({}, this.data[i], {
        label: this.data[i].label + ' !!!',
      });
    }
  },
  delete(id) {
    id = parseInt(id);
    const idx = this.data.findIndex((d) => d.id == id);
    this.data = this.data.filter((e, i) => i != idx);
    return this;
  },
  run(amount) {
    this.data = this.buildData(amount);
    this.selected = null;
  },
  add(amount) {
    this.data = this.data.concat(this.buildData(amount));
    this.selected = null;
  },
  update() {
    this.updateData();
    this.selected = null;
  },
  select(id) {
    this.selected = parseInt(id);
  },
  hideAll() {
    this.backup = this.data;
    this.data = [];
    this.selected = null;
  },
  showAll() {
    this.data = this.backup;
    this.backup = null;
    this.selected = null;
  },
  runLots() {
    this.data = this.buildData(10000);
    this.selected = null;
  },
  clear() {
    this.data = [];
    this.selected = null;
  },
  swapRows() {
    if (this.data.length > 998) {
      var a = this.data[1];
      this.data[1] = this.data[998];
      this.data[998] = a;
    }
  },
};

class MainApp extends Slim {
  items = [];
  selected = null;
  test = [1, 2, 3, 4, 5];

  getClass(item) {
    return item === this.selected ? 'danger' : '';
  }

  deleteOne(item) {
    console.time('delete1');
    store.delete(item.id);
    this.items = store.data;
    console.timeEnd('delete1');
  }

  selectOne(item) {
    console.time('select1');
    this.selected = item;
    console.timeEnd('select1');
  }

  create1k() {
    console.time('create1k');
    store.clear();
    store.run(1000);
    this.items = [...store.data];
    console.timeEnd('create1k');
  }

  append1k() {
    console.time('append1k');
    store.add(1000);
    this.items = [...store.data];
    console.timeEnd('append1k');
  }

  update10() {
    console.time('update10');
    store.update();
    this.items = [...store.data];
    console.timeEnd('update10');
  }

  testClear() {
    console.time('clear');
    store.clear();
    this.items = [...store.data];
    console.timeEnd('clear');
  }

  create10k() {
    performance.mark('create10kstart');
    store.runLots();
    this.items = [...store.data];
    performance.mark('create10kend');
    console.log(
      performance.measure('create10k', 'create10kstart', 'create10kend')
    );
  }

  swap() {
    console.time('swap');
    store.swapRows();
    this.items = [...store.data];
    console.timeEnd('swap');
  }
}

MainApp.useShadow = false;

Slim.element(
  'main-app',
  /*html*/ `
<div id='main'>
<div class="container">
  <div class="jumbotron">
    <div class="row">
      <div class="col-md-6">
        <h1>Slim.js</h1>
      </div>
      <div class="col-md-6">
        <div class="row">
          <div class="col-sm-6 smallpad">
            <button @click="this.create1k()" type='button' class='btn btn-primary btn-block' id='run'>Create 1,000 rows</button>
          </div>
          <div class="col-sm-6 smallpad">
            <button @click="this.create10k()" type='button' class='btn btn-primary btn-block' id='runlots'>Create 10,000 rows</button>
          </div>
          <div class="col-sm-6 smallpad">
            <button @click="this.append1k()" type='button' class='btn btn-primary btn-block' id='add'>Append 1,000 rows</button>
          </div>
          <div class="col-sm-6 smallpad">
            <button @click="this.update10()" type='button' class='btn btn-primary btn-block' id='update'>Update every 10th row</button>
          </div>
          <div class="col-sm-6 smallpad">
            <button @click="this.testClear()" type='button' class='btn btn-primary btn-block' id='clear'>Clear</button>
          </div>
          <div class="col-sm-6 smallpad">
            <button @click="this.swap()" type='button' class='btn btn-primary btn-block' id='swaprows'>Swap Rows</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <table class="table table-hover table-striped test-data">
    <tbody id="tbody">
      <tr *repeat="{{this.items}}" *repeat-cleanup="500" class="{{item === this.selected ? 'danger' : ''}}">
        <td class="col-md-1">{{item.id}}</td>
        <td class="col-md-4">
          <a role="select" @click="this.selectOne(item)">{{item.label}}</a>
        </td>
        <td class="col-md-1">
          <a>
            <span role="delete" @click="this.deleteOne(item)"class="glyphicon glyphicon-remove" aria-hidden="true"></span>
          </a>
        </td>
        <td class="col-md-6">
        </td>
      </tr>
    </tbody>
  </div>
  <span class="preloadicon glyphicon glyphicon-remove" aria-hidden="true"></span>
</div>
</div>`,
  MainApp
);
