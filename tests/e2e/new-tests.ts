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
import nodeCrypto from "node:crypto";
// @ts-expect-error wrong typings
const { webcrypto: crypto }: { webcrypto: Crypto } = nodeCrypto;

import {
  Builder,
  By,
  Capabilities,
  Capability,
  until,
  WebDriver,
  WebElement,
} from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import firefox from "selenium-webdriver/firefox.js";

if (!process.env["BASE_URL"]) {
  console.error("BASE_URL not set!");
  process.exit(1);
}
const BASE_URL = process.env.BASE_URL;

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
    const element = await this.form.findElement(
      By.css(`input[name="${name}"]`)
    );
    await element.clear();
    await element.sendKeys(value);
  }

  async setTextareaField(name: string, value: string) {
    const element = await this.form.findElement(
      By.css(`textarea[name="${name}"]`)
    );
    await element.click();
    await element.clear();
    await element.click();
    await element.sendKeys(value);
  }

  async checkField(name: string, value: boolean) {
    const element = await this.form.findElement(
      By.css(`input[name="${name}"]`)
    );
    if (((await element.getAttribute("checked")) === "true") != value) {
      await this.helper.click(element);
    }
  }

  async getField(name: string) {
    const element = await this.form.findElement(By.css(`*[name="${name}"]`));
    return await element.getAttribute("value");
  }

  async getCheckboxField(name: string) {
    const element = await this.form.findElement(
      By.css(`input[name="${name}"]`)
    );
    return await element.getAttribute("checked");
  }

  private async submit() {
    const submitButton = await this.form.findElement(
      By.css('button[type="submit"]')
    );

    await this.helper.click(submitButton);

    const loadingIndicator = await this.helper.driver.findElement(
      By.css(".spinner-grow")
    );

    await this.helper.driver.wait(
      until.stalenessOf(loadingIndicator),
      10000,
      "loading indicator 1"
    );
  }

  async submitSuccess() {
    await this.submit();

    const alerts = await this.helper.driver.findElements(
      By.css('div[class="alert alert-danger"]')
    );

    assert.equal(alerts.length, 0);
  }

  async submitFailure() {
    await this.submit();

    const alert = await this.helper.driver.findElement(
      By.css('div[class="alert alert-danger"]')
    );

    assert.match(await alert.getText(), /Some errors occurred./);
    return this.getErrors();
  }

  private async getErrors() {
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

  async click(element: WebElement) {
    await this.driver.executeScript(`arguments[0].click()`, element);
  }

  async waitElem(name: string) {
    return await this.driver.wait(
      until.elementLocated(By.css(name)),
      2000,
      `Element ${name} not found`
    );
  }

  async form(name: string) {
    return new FormTester(this, await this.waitElem(name));
  }

  async openNavbar() {
    const navbarButton = this.driver.findElement(
      By.css("button.navbar-toggler")
    );

    await this.click(navbarButton);
  }
}

async function runTestAllBrowsers(
  testFunction: (helper: Helper) => Promise<void>
) {
  await Promise.all([
    runTest("firefox", testFunction),
    runTest("chrome", testFunction),
  ]);
}

async function runTest(
  browser: "firefox" | "chrome",
  testFunction: (helper: Helper) => Promise<void>
) {
  // https://github.com/mozilla/geckodriver/issues/882
  const builder = new Builder()
    .disableEnvironmentOverrides()
    .withCapabilities(
      new Capabilities().setAcceptInsecureCerts(true).setBrowserName(browser)
    );

  if (browser === "chrome") {
    builder.usingServer("http://localhost:9515");
  }

  if (process.env.CI) {
    builder.setChromeOptions(
      new chrome.Options().addArguments(
        "--headless",
        "--no-sandbox",
        "--disable-dev-shm-usage"
      )
    );
    builder.setFirefoxOptions(new firefox.Options().headless());
  }

  const driver = builder.build();

  await driver.manage().window().setRect({
    width: 1000,
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
    console.error(error);
    const screenshot = await driver.takeScreenshot();
    await writeFile("screenshot.png", screenshot, "base64");

    throw error;
  }
}

async function loginEmptyUsernameAndPassword(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/login`);
  const formTester = await helper.form("pw-login");
  assert.deepStrictEqual(
    [["username", "Text muss mindestens 1 Zeichen haben"]],
    await formTester.submitFailure()
  );
}

async function loginWrongUsername(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/login`);
  const formTester = await helper.form("pw-login");
  await formTester.setField("username", "nonexistent");
  assert.deepStrictEqual(
    [["username", "Nutzer existiert nicht!"]],
    await formTester.submitFailure()
  );
}

async function loginEmptyPassword(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/login`);
  const formTester = await helper.form("pw-login");
  await formTester.setField("username", "admin");
  assert.deepStrictEqual(
    [["password", "Falsches Passwort!"]],
    await formTester.submitFailure()
  );
}

async function loginEmptyUsername(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/login`);
  const formTester = await helper.form("pw-login");
  await formTester.setField("password", "password");
  assert.deepStrictEqual(
    [["username", "Text muss mindestens 1 Zeichen haben"]],
    await formTester.submitFailure()
  );
}

async function loginWrongPassword(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/login`);
  const formTester = await helper.form("pw-login");
  await formTester.setField("username", "admin");
  await formTester.setField("password", "wrongpassword");
  assert.deepStrictEqual(
    [["password", "Falsches Passwort!"]],
    await formTester.submitFailure()
  );
}

async function loginCorrect(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/login`);
  const formTester = await helper.form("pw-login");
  await formTester.setField("username", "admin");
  await formTester.setField("password", "changeme");
  await formTester.submitSuccess();
}

async function welcomeWorks(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/`);
  assert.match(
    await (await helper.waitElem("pw-welcome")).getText(),
    /Welcome/
  );
}

async function imprintWorks(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/`);
  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/imprint"]`))
  );
  await helper.driver
    .switchTo()
    .window((await helper.driver.getAllWindowHandles())[1]);
  assert.match(
    await (await helper.waitElem("pw-imprint")).getText(),
    /Angaben gemäß § 5 TMG/
  );
  await helper.driver.close();
  await helper.driver
    .switchTo()
    .window((await helper.driver.getAllWindowHandles())[0]);
}

async function privacyWorks(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/`);
  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/privacy"]`))
  );
  await helper.driver
    .switchTo()
    .window((await helper.driver.getAllWindowHandles())[1]);
  assert.match(
    await (await helper.waitElem("pw-privacy")).getText(),
    /Verantwortlicher/
  );
  await helper.driver.close();
  await helper.driver
    .switchTo()
    .window((await helper.driver.getAllWindowHandles())[0]);
}

async function logoutWorks(helper: Helper) {
  await loginCorrect(helper);
  await helper.openNavbar();
  await helper.driver.get(`${BASE_URL}/imprint`);
  await helper.waitElem("pw-imprint");
  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/logout"]`))
  );
  await helper.form("pw-login");
}

async function createUserAllFields(helper: Helper) {
  await loginCorrect(helper);

  await helper.openNavbar();
  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/users"]`))
  );
  await helper.form("pw-users");
  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/users/create"]`))
  );
  let form = await helper.form("pw-user-create");
  const username = `username${crypto.getRandomValues(new Uint32Array(1))[0]}`;
  const email = `email${Math.random()}`.substring(0, 15);
  const group = `group${Math.random()}`.substring(0, 15);
  const age = Math.floor(Math.random() * 10);
  const away = Math.random() > 0.5 ? true : false;
  const deleted = Math.random() > 0.5 ? true : false;
  await form.setField("0,username", username);
  await form.setField("0,openid_id", email);
  await form.setField("0,group", group);
  await form.setField("0,age", `${age}`);
  await form.checkField("0,away", away);
  await form.checkField("0,deleted", deleted);
  await form.submitSuccess();
  await helper.driver.wait(until.urlContains("/users/edit/"), 2000);
  const id = (await helper.driver.getCurrentUrl()).substring(
    "https://localhost:8443/users/edit/".length
  );
  const loadingIndicator1 = await helper.driver.findElement(
    By.css(".spinner-grow")
  );

  await helper.driver.wait(
    until.stalenessOf(loadingIndicator1),
    10000,
    "loading indicator 1 7"
  );
  form = await helper.form("pw-user-create");
  assert.equal(await form.getField("0,username"), username);
  assert.equal(await form.getField("0,openid_id"), email);
  assert.equal(await form.getField("0,group"), group);
  assert.equal(await form.getField("0,age"), `${age}`);
  assert.equal((await form.getCheckboxField("0,away")) === "true", away);
  assert.equal((await form.getCheckboxField("0,deleted")) === "true", deleted);

  const username2 = `username${crypto.getRandomValues(new Uint32Array(1))[0]}`;
  await form.setField("0,username", username2);
  await form.submitSuccess();

  await helper.click(
    await helper.driver.findElement(By.css(`button[class="btn btn-secondary"]`))
  );

  form = await helper.form("pw-users");

  await form.setField("filters,id", id);
  await form.setField("filters,username", username2);

  const loadingIndicator = await helper.driver.findElement(
    By.css(".spinner-grow")
  );

  await helper.driver.wait(
    until.stalenessOf(loadingIndicator),
    2000,
    "loading indicator 1"
  );

  // click view button
  await helper.click(await helper.driver.findElement(By.css(`td p a`)));

  form = await helper.form("pw-user-create");
  assert.equal(await form.getField("0,username"), username2);
  assert.equal(await form.getField("0,openid_id"), email);
  assert.equal(await form.getField("0,group"), group);
  assert.equal(await form.getField("0,age"), `${age}`);
  assert.equal((await form.getCheckboxField("0,away")) === "true", away);
  assert.equal((await form.getCheckboxField("0,deleted")) === "true", deleted);

  //await helper.driver.sleep(1000)
}

async function createProjectAllFields(helper: Helper) {
  await loginCorrect(helper);
  await helper.openNavbar();

  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/projects"]`))
  );
  await helper.form("pw-projects");
  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/projects/create"]`))
  );
  let form = await helper.form("pw-project-create");
  const title = `title${Math.random()}`;
  const info = `info${Math.random()}`;
  const place = `place${Math.random()}`;
  const costs = Math.floor(Math.random() * 10);
  const min_age = Math.floor(Math.random() * 10);
  const max_age = Math.floor(Math.random() * 10);
  const min_participants = Math.floor(Math.random() * 10) + 1;
  const max_participants = Math.floor(Math.random() * 10) + 1;
  const random_assignments = Math.random() > 0.5 ? true : false;
  const deleted = Math.random() > 0.5 ? true : false;
  await form.setField("title", title);
  await form.setTextareaField("info", info);
  await form.setField("place", place);
  await form.setField("costs", `${costs}`);
  await form.setField("min_age", `${min_age}`);
  await form.setField("max_age", `${max_age}`);
  await form.setField("min_participants", `${min_participants}`);
  await form.setField("max_participants", `${max_participants}`);
  await form.checkField("random_assignments", random_assignments);
  await form.checkField("deleted", deleted);
  await form.submitSuccess();
  await helper.driver.wait(until.urlContains("/projects/edit/"), 2000);
  const id = (await helper.driver.getCurrentUrl()).substring(
    "https://localhost:8443/projects/edit/".length
  );
  const loadingIndicator1 = await helper.driver.findElement(
    By.css(".spinner-grow")
  );

  await helper.driver.wait(
    until.stalenessOf(loadingIndicator1),
    10000,
    "loading indicator 1 2"
  );
  form = await helper.form("pw-project-create");
  assert.equal(await form.getField("title"), title);
  assert.equal(await form.getField("info"), info);
  assert.equal(await form.getField("place"), place);
  assert.equal(await form.getField("costs"), `${costs}`);
  assert.equal(await form.getField("min_age"), `${min_age}`);
  assert.equal(await form.getField("max_age"), `${max_age}`);
  assert.equal(await form.getField("min_participants"), `${min_participants}`);
  assert.equal(await form.getField("max_participants"), `${max_participants}`);
  assert.equal(
    (await form.getCheckboxField("random_assignments")) === "true",
    random_assignments
  );
  assert.equal((await form.getCheckboxField("deleted")) === "true", deleted);

  const title2 = `title${Math.random()}`;
  await form.setField("title", title2);
  await form.submitSuccess();

  await helper.click(
    await helper.driver.findElement(By.css(`button[class="btn btn-secondary"]`))
  );

  form = await helper.form("pw-projects");

  await form.setField("filters,id", id);
  await form.setField("filters,title", title2);

  const loadingIndicator = await helper.driver.findElement(
    By.css(".spinner-grow")
  );

  await helper.driver.wait(
    until.stalenessOf(loadingIndicator),
    2000,
    "loading indicator 2"
  );

  // click view button
  await helper.click(await helper.driver.findElement(By.css(`td p a`)));

  form = await helper.form("pw-project-create");
  assert.equal(await form.getField("title"), title2);
  assert.equal(await form.getField("info"), info);
  assert.equal(await form.getField("place"), place);
  assert.equal(await form.getField("costs"), `${costs}`);
  assert.equal(await form.getField("min_age"), `${min_age}`);
  assert.equal(await form.getField("max_age"), `${max_age}`);
  assert.equal(await form.getField("min_participants"), `${min_participants}`);
  assert.equal(await form.getField("max_participants"), `${max_participants}`);
  assert.equal(
    (await form.getCheckboxField("random_assignments")) === "true",
    random_assignments
  );
  assert.equal((await form.getCheckboxField("deleted")) === "true", deleted);
}

async function checkNotLoggedInUsers(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/users`);

  const alert = await helper.driver.wait(
    until.elementLocated(By.css('div[class="alert alert-danger"]')),
    2000,
    "Expected submit failure 2"
  );

  assert.match(await alert.getText(), /Nicht angemeldet!/);
}

async function checkNotLoggedInProjects(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/projects`);

  const alert = await helper.driver.wait(
    until.elementLocated(By.css('div[class="alert alert-danger"]')),
    2000,
    "Expected submit failure 3"
  );

  assert.match(await alert.getText(), /Nicht angemeldet!/);
}

await Promise.all([
  runTestAllBrowsers(createProjectAllFields),
  runTestAllBrowsers(createUserAllFields),
  runTestAllBrowsers(checkNotLoggedInUsers),
  runTestAllBrowsers(checkNotLoggedInProjects),
]);
await Promise.all([
  await runTestAllBrowsers(loginEmptyUsernameAndPassword),
  await runTestAllBrowsers(loginWrongUsername),
  await runTestAllBrowsers(loginEmptyPassword),
  await runTestAllBrowsers(loginEmptyUsername),
]);
await Promise.all([
  await runTestAllBrowsers(loginWrongPassword),
  await runTestAllBrowsers(loginCorrect),
  await runTestAllBrowsers(welcomeWorks),
  await runTestAllBrowsers(imprintWorks),
  await runTestAllBrowsers(privacyWorks),
  await runTestAllBrowsers(logoutWorks),
]);
