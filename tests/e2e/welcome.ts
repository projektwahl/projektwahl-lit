import assert from "assert/strict";

import {
  Builder,
  By,
  Capabilities,
  Capability,
  WebElement,
} from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
//import repl from "repl";
import crypto from "node:crypto";
const webcrypto = crypto.webcrypto as unknown as Crypto;

if (!process.env["BASE_URL"]) {
  console.error("BASE_URL not set!");
  process.exit(1);
}

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
  // @ts-expect-error wrong typings
  return (await element.getShadowRoot()) as WebElement; // eslint-disable-line @typescript-eslint/no-unsafe-call
}

// SELENIUM_BROWSER=chrome node --experimental-loader ./src/loader.js --enable-source-maps tests/e2e/welcome.js
const driver = await new Builder()
  .forBrowser("firefox")
  .withCapabilities(Capabilities.firefox().set("acceptInsecureCerts", true))
  .withCapabilities(
    Capabilities.chrome().set(Capability.ACCEPT_INSECURE_TLS_CERTS, true)
  )
  .setChromeOptions(
    new chrome.Options().addArguments(
      "--headless",
      "--no-sandbox",
      "--disable-dev-shm-usage"
    )
  )
  .build();
await driver.manage().setTimeouts({
  implicit: 1000,
});
await driver.manage().window().setRect({
  width: 500,
  height: 1000,
});

try {
  await driver.get(process.env.BASE_URL);
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

  const groupName = [...webcrypto.getRandomValues(new Uint8Array(8))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  {
    // edit user

    const pwUsers = await (await shadow(pwApp)).findElement(By.css("pw-users"));

    const user2 = await (
      await shadow(pwUsers)
    ).findElement(By.css('a[href="/users/edit/7"]'));

    await user2.click();

    const pwUserCreate = await (
      await shadow(pwApp)
    ).findElement(By.css("pw-user-create"));

    const pwUserGroup = await (
      await shadow(pwUserCreate)
    ).findElement(By.css('input[name="group"]'));

    await pwUserGroup.clear();
    await pwUserGroup.sendKeys(groupName);

    const submitButton = await (
      await shadow(pwUserCreate)
    ).findElement(By.css('button[type="submit"]'));

    await driver.executeScript(
      "arguments[0].scrollIntoView(true);",
      submitButton
    );

    await driver.sleep(250);

    await submitButton.click();
  }

  {
    // view user

    await driver.executeScript(
      "arguments[0].scrollIntoView(true);",
      accountsLink
    );

    await driver.sleep(250);

    await accountsLink.click();

    const pwUsers = await (await shadow(pwApp)).findElement(By.css("pw-users"));

    const user2 = await (
      await shadow(pwUsers)
    ).findElement(By.css('a[href="/users/view/7"]'));

    await user2.click();

    const pwUserCreate = await (
      await shadow(pwApp)
    ).findElement(By.css("pw-user-create"));

    const pwUserGroup = await (
      await shadow(pwUserCreate)
    ).findElement(By.css('input[name="group"]'));

    assert.equal(await pwUserGroup.getAttribute("value"), groupName);

    await driver.navigate().back();
  }
/*
  const theRepl = repl.start();
  theRepl.context.driver = driver;
  theRepl.context.shadow = shadow;
  theRepl.context.pwApp = pwApp;
  theRepl.context.By = (await import("selenium-webdriver")).By;

  theRepl.on("exit", () => {
    void driver.quit();
  });
*/
} catch (error) {
  console.error(error);
  await driver.quit();
}
