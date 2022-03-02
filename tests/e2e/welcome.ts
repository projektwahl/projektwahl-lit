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

export async function click(element: WebElement) {
  // currently this is just too buggy

  //await driver.executeScript(`arguments[0].scrollIntoView(true);`, element);

  //await driver.sleep(250);

  await driver.executeScript(`arguments[0].click()`, element);
}

// SELENIUM_BROWSER=chrome node --experimental-loader ./src/loader.js --enable-source-maps tests/e2e/welcome.js
const builder = new Builder()
  .forBrowser("firefox")
  .withCapabilities(Capabilities.firefox().set("acceptInsecureCerts", true))
  .withCapabilities(
    Capabilities.chrome().set(Capability.ACCEPT_INSECURE_TLS_CERTS, true)
  );

if (process.env.CI) {
  builder.setChromeOptions(
    new chrome.Options().addArguments(
      "--headless",
      "--no-sandbox",
      "--disable-dev-shm-usage"
    )
  );
}
const driver = builder.build();
await driver.manage().setTimeouts({
  implicit: 5000,
});
await driver.manage().window().setRect({
  width: 500,
  height: 1000,
});

try {
  // @ts-expect-error the typescript bindings are heavily outdated
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await driver.setNetworkConditions({
    offline: false,
    latency: 100, // Additional latency (ms).
    download_throughput: 50 * 1024, // Maximal aggregated download throughput.
    upload_throughput: 50 * 1024, // Maximal aggregated upload throughput.
  });

  await driver.get(process.env.BASE_URL);

  {
    const pwApp = await driver.findElement(By.css("pw-app"));

    const navbarButton = await (
      await shadow(pwApp)
    ).findElement(By.css("button.navbar-toggler"));

    await click(navbarButton);
  }

  {
    const pwApp = await driver.findElement(By.css("pw-app"));

    const loginLink = await (
      await shadow(pwApp)
    ).findElement(By.css('a[href="/login"]'));

    await click(loginLink);

    await driver.switchTo().window((await driver.getAllWindowHandles())[1]);
  }

  {
    // login
    const pwApp = await driver.findElement(By.css("pw-app"));

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

    await click(loginButton);
  }

  {
    await driver.switchTo().window((await driver.getAllWindowHandles())[0]);

    const pwApp = await driver.findElement(By.css("pw-app"));

    await (await shadow(pwApp)).findElement(By.css("pw-welcome"));
  }

  const groupName = [...webcrypto.getRandomValues(new Uint8Array(8))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  {
    // edit user

    const pwApp = await driver.findElement(By.css("pw-app"));

    const accountsLink = await (
      await shadow(pwApp)
    ).findElement(By.css('a[href="/users"]'));

    await click(accountsLink);

    const pwUsers = await (await shadow(pwApp)).findElement(By.css("pw-users"));

    const user2 = await (
      await shadow(pwUsers)
    ).findElement(By.css('a[href="/users/edit/7"]'));

    await click(user2);

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

    await click(submitButton);

    await (await shadow(pwApp)).findElement(By.css("pw-welcome"));
  }

  {
    // view user

    const pwApp = await driver.findElement(By.css("pw-app"));

    const accountsLink = await (
      await shadow(pwApp)
    ).findElement(By.css('a[href="/users"]'));

    await click(accountsLink);

    const pwUsers = await (await shadow(pwApp)).findElement(By.css("pw-users"));

    const user = await (
      await shadow(pwUsers)
    ).findElement(By.css('a[href="/users/view/7"]'));

    await click(user);

    const pwUserCreate = await (
      await shadow(pwApp)
    ).findElement(By.css("pw-user-create"));

    const pwUserGroup = await (
      await shadow(pwUserCreate)
    ).findElement(By.css('input[name="group"]'));

    assert.equal(await pwUserGroup.getAttribute("value"), groupName);

    await driver.navigate().back();
  }

  {
    // imprint

    const pwApp = await driver.findElement(By.css("pw-app"));

    const imprintLink = await (
      await shadow(pwApp)
    ).findElement(By.css('a[href="/imprint"]'));

    await click(imprintLink);

    await driver.switchTo().window((await driver.getAllWindowHandles())[1]);
    const pwApp2 = await driver.findElement(By.css("pw-app"));

    const pwImprint = await (
      await shadow(pwApp2)
    ).findElement(By.css("pw-imprint"));

    assert.match(await pwImprint.getText(), /Angaben gemäß § 5 TMG/);

    await driver.close();

    await driver.switchTo().window((await driver.getAllWindowHandles())[0]);
  }

  {
    // privacy

    const pwApp = await driver.findElement(By.css("pw-app"));

    const privacyLink = await (
      await shadow(pwApp)
    ).findElement(By.css('a[href="/privacy"]'));

    await click(privacyLink);

    await driver.switchTo().window((await driver.getAllWindowHandles())[1]);
    const pwApp2 = await driver.findElement(By.css("pw-app"));

    const pwPrivacy = await (
      await shadow(pwApp2)
    ).findElement(By.css("pw-privacy"));

    assert.match(await pwPrivacy.getText(), /Verantwortlicher/);

    await driver.close();

    await driver.switchTo().window((await driver.getAllWindowHandles())[0]);
  }

  {
    // filtering

    const pwApp = await driver.findElement(By.css("pw-app"));

    const accountsLink = await (
      await shadow(pwApp)
    ).findElement(By.css('a[href="/users"]'));

    await click(accountsLink);

    const pwUsers = await (await shadow(pwApp)).findElement(By.css("pw-users"));

    const filterUsername = await (
      await shadow(pwUsers)
    ).findElement(By.css('input[name="filters,username"]'));

    await filterUsername.sendKeys("admin");

    const loadingSpinner = await (
      await shadow(pwUsers)
    ).findElement(By.css(".spinner-grow"));

    assert.ok(loadingSpinner.isDisplayed());

    console.log(new Date());

    await driver.wait(until.stalenessOf(loadingSpinner));

    console.log(new Date());
  }

  {
    // logout
    const pwApp = await driver.findElement(By.css("pw-app"));

    const logoutButton = await (
      await shadow(pwApp)
    ).findElement(By.partialLinkText("Logout"));

    assert.equal(await logoutButton.getText(), "Logout admin");

    await logoutButton.click();

    const loginLink = await (
      await shadow(pwApp)
    ).findElement(By.css('a[href="/login"]'));

    assert.equal(await loginLink.getText(), "Login");
  }

  {
    // check logged out by checking no permissions

    const pwApp = await driver.findElement(By.css("pw-app"));

    const projectsLink = await (
      await shadow(pwApp)
    ).findElement(By.css('a[href="/projects"]'));

    await click(projectsLink);

    const pwProjects = await (
      await shadow(pwApp)
    ).findElement(By.css("pw-projects"));

    const alert = await (
      await shadow(pwProjects)
    ).findElement(By.css('div[class="alert alert-danger"]'));

    assert.match(await alert.getText(), /Not logged in!/);
  }

  await driver.quit();

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
  //await driver.quit();

  throw error;
}
