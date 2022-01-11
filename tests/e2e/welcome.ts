import {
  Builder,
  By,
  Key,
  until,
  Capabilities,
  Capability,
  WebElement,
} from "selenium-webdriver";

// https://chrome.google.com/webstore/detail/selenium-ide/mooikfkahbdckldjjndioackbalphokd
// https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/

// https://bugzilla.mozilla.org/show_bug.cgi?id=1489490
// Firefox 96, geckodriver 0.31.0 required

// https://github.com/SeleniumHQ/selenium/commit/4e24e999b7f12510793e8bf515314bf2fa7ae5e8
// @types/selenium-webdriver is probably missing those

// https://w3c.github.io/webdriver/#get-element-shadow-root

export async function shadow(element: WebElement) {
  return await element.getShadowRoot() as WebElement;
}

// SELENIUM_BROWSER=chrome node  --experimental-loader ./src/loader.js --enable-source-maps tests/e2e/welcome.js
(async function example() {
  let driver = await new Builder()
    .forBrowser("firefox")
    .withCapabilities(Capabilities.firefox().set("acceptInsecureCerts", true))
    .withCapabilities(
      Capabilities.chrome().set(Capability.ACCEPT_INSECURE_TLS_CERTS, true)
    )
    .build();
  await driver.manage().setTimeouts({
    implicit: 1000,
  });

  try {
    await driver.get("https://localhost:8443/");
    const pwApp = await driver.findElement(By.css('pw-app'));
    
    // doesn't work on firefox
    //const pwAppShadow: WebElement = await driver.executeScript("return arguments[0].shadowRoot", pwApp);

    const loginButton = await (await shadow(pwApp)).findElement(By.css('a[href="/login"]'));

    loginButton.click();

    const pwLogin = await (await shadow(pwApp)).findElement(By.css('pw-login'));

    const usernameField = await (await shadow(pwLogin)).findElement(By.css('input[name="username"]'));
    usernameField.sendKeys("admin");

    const passwordField = await (await shadow(pwLogin)).findElement(By.css('input[name="password"]'));
    passwordField.sendKeys("changeme");

    (await (await shadow(pwLogin)).findElement(By.css('button[type="submit"]'))).click();

    const logoutButton = await (await shadow(pwApp)).findElement(By.partialLinkText("Logout"));

    console.log(await logoutButton.getText())
    
  } finally {
    await driver.quit();
  }
})();
