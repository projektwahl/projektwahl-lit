/*
projektwahl-lit is a software to manage choosing projects and automatically assigning people to projects.
Copyright (C) 2021 Moritz Hedtke

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
*/
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import assert from "assert/strict";
import { writeFile } from "fs/promises";

import {
  Builder,
  By,
  Capabilities,
  Capability,
  until,
  WebDriver,
  WebElement,
} from "selenium-webdriver";
import chrome, { Driver } from "selenium-webdriver/chrome.js";
//import repl from "repl";

if (!process.env["BASE_URL"]) {
  console.error("BASE_URL not set!");
  process.exit(1);
}
const BASE_URL = process.env.BASE_URL;

// all tests should be independently runnable (as we don't use test runner)
// implement a simple implementation of that ourself
// before every test we need to reset the database and restart the browser

// maybe convert to that class-based approach

// all actions should verify that they are done and that they are successful.

if (!process.env.BASE_URL) {
  throw new Error("BASE_URL not set!");
}

class FormTester {
  helper: Helper;
  form: WebElement;

  constructor(helper: Helper, form: WebElement) {
    this.helper = helper;
    this.form = form;
  }

  async setField(name: string, value: string) {
    const element = await this.form.findElement(By.css(`input[name=${name}]`));
    await element.clear();
    await element.sendKeys(value);
  }

  private async submit() {
    const submitButton = await this.form.findElement(
      By.css('button[type="submit"]')
    );

    await this.helper.click(submitButton);
  }

  async submitSuccess() {
    await this.submit();
  }

  async submitFailure() {
    await this.submit();

    const alert = await this.helper.driver.wait(
      until.elementLocated(By.css('div[class="alert alert-danger"]')),
      1000,
      "Expected submit failure"
    );

    assert.match(await alert.getText(), /Some errors occurred./);
  }

  async getErrorForField(name: string) {
    console.log(
      await this.form
        .findElement(By.css(`input[name=${name}] + .invalid-feedback`))
        .getText()
    );
  }

  async getErrors() {
    return Promise.all(
      (await this.form.findElements(By.css(`.invalid-feedback`))).map(
        async (e) => [
          await e
            .findElement(By.xpath("preceding-sibling::input"))
            .getAttribute("name"),
          await e.getText(),
        ]
      )
    );
  }
}

// https://chrome.google.com/webstore/detail/selenium-ide/mooikfkahbdckldjjndioackbalphokd
// https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/

// https://bugzilla.mozilla.org/show_bug.cgi?id=1489490
// Firefox 96, geckodriver 0.31.0 required
// https://github.com/mozilla/geckodriver/issues/1994

// https://github.com/mozilla/geckodriver/issues/776
// https://github.com/w3c/webdriver/issues/1005

// https://github.com/SeleniumHQ/selenium/commit/4e24e999b7f12510793e8bf515314bf2fa7ae5e8
// @types/selenium-webdriver is probably missing those

// https://w3c.github.io/webdriver/#get-element-shadow-root

class Helper {
  driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }
  /*
  async shadow(element: WebElement) {
    // @ts-expect-error types are wrong
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions,@typescript-eslint/no-unsafe-call
    return (await element.getShadowRoot()) as WebElement;
  }
*/
  async click(element: WebElement) {
    // currently this is just too buggy

    //await driver.executeScript(`arguments[0].scrollIntoView(true);`, element);

    //await driver.sleep(250);

    await this.driver.executeScript(`arguments[0].click()`, element);
  }

  async form(name: string) {
    return new FormTester(
      this,
      await this.driver.wait(until.elementLocated(By.css(name)))
    );
  }
}

async function runTest(testFunction: (helper: Helper) => Promise<void>) {
  // SELENIUM_BROWSER=chrome node --experimental-loader ./src/loader.js --enable-source-maps tests/e2e/welcome.js
  const builder = new Builder()
    .forBrowser("firefox")
    .withCapabilities(
      Capabilities.firefox()
        .set("acceptInsecureCerts", true)
        .setPageLoadStrategy("none")
    )
    .withCapabilities(
      Capabilities.chrome()
        .set(Capability.ACCEPT_INSECURE_TLS_CERTS, true)
        .setPageLoadStrategy("none")
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

  /*await driver.manage().setTimeouts({
        implicit: 1000,
    });*/
  await driver.manage().window().setRect({
    width: 500,
    height: 1000,
  });

  try {
    await testFunction(new Helper(driver));
    // important

    // TODO FIXME editing the project leaders + members

    // TODO test pagination

    // TODO test sorting

    // TODO FIXME voting

    // TODO test openid

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
    const screenshot = await driver.takeScreenshot();
    await writeFile("screenshot.png", screenshot, "base64");

    //await driver.quit();

    throw error;
  }
}

/*// @ts-expect-error wrong typings
await helper.driver.setNetworkConditions({
  offline: false,
  latency: 100, // Additional latency (ms).
  download_throughput: 50 * 1024, // Maximal aggregated download throughput.
  upload_throughput: 50 * 1024, // Maximal aggregated upload throughput.
});

await helper.driver.navigate().to(`${BASE_URL}/login`)

const loadingIndicator = await helper.driver.findElement(By.css(".spinner-grow"));

await helper.driver.wait(until.stalenessOf(loadingIndicator))*/

export async function loginEmptyUsernameAndPassword(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/login`);
  const formTester = await helper.form("pw-login");
  await formTester.submitFailure();
  assert.deepStrictEqual(
    [["username", "Text muss mindestens 1 Zeichen haben"]],
    await formTester.getErrors()
  );
}

export async function loginWrongUsername(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/login`);
  const formTester = await helper.form("pw-login");
  await formTester.setField("username", "nonexistent");
  await formTester.submitFailure();
  assert.deepStrictEqual(
    [["username", "Nutzer existiert nicht!"]],
    await formTester.getErrors()
  );
}

export async function loginEmptyPassword(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/login`);
  const formTester = await helper.form("pw-login");
  await formTester.setField("username", "admin");
  await formTester.submitFailure();
  assert.deepStrictEqual(
    [["password", "Falsches Passwort!"]],
    await formTester.getErrors()
  );
}

export async function loginEmptyUsername(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/login`);
  const formTester = await helper.form("pw-login");
  await formTester.setField("password", "password");
  await formTester.submitFailure();
  assert.deepStrictEqual(
    [["username", "Text muss mindestens 1 Zeichen haben"]],
    await formTester.getErrors()
  );
}

export async function loginWrongPassword(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/login`);
  const formTester = await helper.form("pw-login");
  await formTester.setField("username", "admin");
  await formTester.setField("password", "wrongpassword");
  await formTester.submitFailure();
  assert.deepStrictEqual(
    [["password", "Falsches Passwort!"]],
    await formTester.getErrors()
  );
}

export async function loginCorrect(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/login`);
  const formTester = await helper.form("pw-login");
  await formTester.setField("username", "admin");
  await formTester.setField("password", "changeme");
  await formTester.submitSuccess();
}

await runTest(loginEmptyUsernameAndPassword);
await runTest(loginWrongUsername);
await runTest(loginEmptyPassword);
await runTest(loginEmptyUsername);
await runTest(loginWrongPassword);
await runTest(loginCorrect);
