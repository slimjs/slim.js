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
      "webdriver.chrome.driver": "./bin/chromedriver"
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
          "chromeOptions" : {
              "args" : ["--start-maximized", "--headless"]
          },
          "javascriptEnabled": true,
          "acceptSslCerts": true,
          "headless": true
        }
    }
  }
};
