global.targetServer = process.env.targetServer || 'http://localhost:8000';
const StaticServer = require('static-server');
global.staticServer = new StaticServer({
    rootPath: '.',
    port: 8000,
    host: '127.0.0.1',
    cors: '*'
});


global.generateHASH = function() {
  var _sym = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var str = '';

  for (var i = 0; i < 8; i++) {
    str += _sym[parseInt(Math.random() * (_sym.length))];
  }
  return str;
};

global.testHash = global.generateHASH();

var seleniumJar = require('selenium-server-standalone-jar');

module.exports = {
  "output_folder" : "reports",
  "custom_commands_path" : "",
  "custom_assertions_path" : "",
  "page_objects_path" : "",
  "globals_path" : "",
  "live_output": true,
  "disable_colors": false,


  "selenium" : {
    "start_process" : true,
    "server_path": "./bin/selenium.jar",
    "host": "127.0.0.1",
    "port": 4444,
    "cli_args": {
      "webdriver.chrome.driver": "./bin/chromedriver",
      "webdriver.phantomjs.driver": "./node_modules/phantomjs/bin/phantomjs"
    }
  },

  "test_settings" : {
    "default" : {
        "silent": true,
        "screenshots": {
          "enabled": true,
          "path": "reports"
        },
        "globals": {
          "abortOnAssertionFailure": true,
          "waitForConditionTimeout": 25000,
        },
        "desiredCapabilities": {
          "browserName": "chrome",
          "javascriptEnabled": true,
          "acceptSslCerts": true,
          "headless": true
        }
    },
    "dev": {
      "screenshots": {
          "enabled": true,
          "path": "reports"
        },
        "globals": {
          "abortOnAssertionFailure": true,
          "waitForConditionTimeout": 15000
        },
        "desiredCapabilities": {
          "browserName": "chrome",
          "javascriptEnabled": true,
          "acceptSslCerts": true
        }
    },
    "phantomjs": {
      "browserName": "phantomjs",
      "javascriptEnabled": true,
      "acceptSslCerts": true,
      "phantomjs.binary.path": "./node_modules/phantomjs/bin/phantomjs"
    },
    "chrome": {
      "desiredCapabilities": {
        "browserName": "chrome",
        "chromeOptions" : {
          "args" : ["--headless"]
        },
        "javascriptEnabled": true // set to false to test progressive enhancement
      }
    }
  }
};
