require('selenium-download').ensure('./bin', function(err) {
  if (err) {
    return console.error(err);
  } else {
    console.log('Selenium & ChromeDriver downloaded to:', './bin');
  }
});