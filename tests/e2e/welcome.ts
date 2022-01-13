import assert from "assert/strict";

import {
  Builder,
  By,
  Capabilities,
  Capability,
  until,
  WebElement,
} from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import repl from 'repl'

// https://chrome.google.com/webstore/detail/selenium-ide/mooikfkahbdckldjjndioackbalphokd
// https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/

// https://bugzilla.mozilla.org/show_bug.cgi?id=1489490
// Firefox 96, geckodriver 0.31.0 required

// https://github.com/mozilla/geckodriver/issues/776
// https://github.com/w3c/webdriver/issues/1005

// https://github.com/SeleniumHQ/selenium/commit/4e24e999b7f12510793e8bf515314bf2fa7ae5e8
// @types/selenium-webdriver is probably missing those

// https://w3c.github.io/webdriver/#get-element-shadow-root

export async function shadow(element: WebElement) {
  return (await element.getShadowRoot()) as WebElement; // eslint-disable-line @typescript-eslint/no-unsafe-call
}

// SELENIUM_BROWSER=chrome node --experimental-loader ./src/loader.js --enable-source-maps tests/e2e/welcome.js
const driver = await new Builder()
  .forBrowser("firefox")
  .withCapabilities(Capabilities.firefox().set("acceptInsecureCerts", true))
  .withCapabilities(
    Capabilities.chrome().set(Capability.ACCEPT_INSECURE_TLS_CERTS, true)
  )
  /*.setChromeOptions(
    new chrome.Options().addArguments(
      "--headless",
      "--no-sandbox",
      "--disable-dev-shm-usage"
    )
  )*/
  .build();
await driver.manage().setTimeouts({
  implicit: 1000,
});
await driver.manage().window().setRect({
  width: 500,
  height: 1000,
});

try {
  await driver.get("https://localhost:8443/");
  const pwApp = await driver.findElement(By.css("pw-app"));

  // doesn't work on firefox
  //const pwAppShadow: WebElement = await driver.executeScript("return arguments[0].shadowRoot", pwApp);

  const navbarButton = await (
    await shadow(pwApp)
  ).findElement(By.css("button.navbar-toggler"));

  await navbarButton.click();

  const loginLink = await (
    await shadow(pwApp)
  ).findElement(By.css('a[href="/login"]'));

  await loginLink.click();

  const pwLogin = await (await shadow(pwApp)).findElement(By.css("pw-login"));

  const usernameField = await (
    await shadow(pwLogin)
  ).findElement(By.css('input[name="username"]'));
  await usernameField.sendKeys("admin");

  const passwordField = await (
    await shadow(pwLogin)
  ).findElement(By.css('input[name="password"]'));
  await passwordField.sendKeys("changeme");

  const loginButton = await (
    await shadow(pwLogin)
  ).findElement(By.css('button[type="submit"]'));

  await loginButton.click();

  const logoutButton = await (
    await shadow(pwApp)
  ).findElement(By.partialLinkText("Logout"));

  assert.equal(await logoutButton.getText(), "Logout admin");

  const accountsLink = await (
    await shadow(pwApp)
  ).findElement(By.css('a[href="/users"]'));

  await accountsLink.click();


  {
    // view user

    const pwUsers = await (await shadow(pwApp)).findElement(By.css("pw-users"));

    const user2 = await (
      await shadow(pwUsers)
    ).findElement(By.css('a[href="/users/view/2"]'));

    user2.click()

    const pwUserCreate = await (await shadow(pwApp)).findElement(By.css("pw-user-create"));

    const pwUserGroup = await (await shadow(pwUserCreate)).findElement(By.css('input[name="group"]'));

    assert.equal(await pwUserGroup.getAttribute("value"), "a");

    await driver.navigate().back()
  }

  {
    // edit user

    const pwUsers = await (await shadow(pwApp)).findElement(By.css("pw-users"));

    const user2 = await (
      await shadow(pwUsers)
    ).findElement(By.css('a[href="/users/edit/2"]'));

    user2.click()

    const pwUserCreate = await (await shadow(pwApp)).findElement(By.css("pw-user-create"));

    const pwUserGroup = await (await shadow(pwUserCreate)).findElement(By.css('input[name="group"]'));

    pwUserGroup.clear()
    pwUserGroup.sendKeys("awesomegroup");

    const submitButton = await (
      await shadow(pwUserCreate)
    ).findElement(By.css('button[type="submit"]'));

    await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton)

    await driver.sleep(250);
    
    await submitButton.click();
  }

  const theRepl = repl.start();
  theRepl.context.driver = driver;
  theRepl.context.shadow = shadow;
  theRepl.context.pwApp = pwApp;
  theRepl.context.By = (await import("selenium-webdriver")).By

  theRepl.on("exit", async () => {
    await driver.quit();
  })
} catch (error) {
  console.error(error)
  //await driver.quit();
}
