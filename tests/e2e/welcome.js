import { Builder, By, Key, until, Capabilities, Capability } from "selenium-webdriver";

// https://chrome.google.com/webstore/detail/selenium-ide/mooikfkahbdckldjjndioackbalphokd
// https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/

// shadow dom support is so bad you basically need to execute javascript to do this.

// SELENIUM_BROWSER=chrome node tests/e2e/welcome.js
(async function example() {
  let driver = await new Builder()
    .forBrowser("firefox")
    .withCapabilities(Capabilities.firefox().set("acceptInsecureCerts", true))
    .withCapabilities(Capabilities.chrome().set(Capability.ACCEPT_INSECURE_TLS_CERTS, true))
    .build();
  await driver.manage().setTimeouts({
    implicit: 1000
  })
  
  try {
    await driver.get("https://localhost:8443/");
    await driver.findElement(By.xpath(`//a[@href='/login']`)).click();
  } finally {
    await driver.quit();
  }
})();
