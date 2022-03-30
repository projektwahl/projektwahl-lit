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
  Key,
  logging,
  until,
  WebDriver,
  WebElement,
} from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import firefox from "selenium-webdriver/firefox.js";
import { installConsoleHandler } from "selenium-webdriver/lib/logging.js";
import { sql } from "../../src/server/database.js";
import { setup } from "../../src/server/setup-internal.js";

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

  async resetField(name: string, value: string) {
    const element = await this.form.findElement(
      By.css(`input[name="${name}"]`)
    );
    // really? https://github.com/w3c/webdriver/issues/1630
    await element.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    await element.sendKeys(value);
  }

  async setField(name: string, value: string) {
    const element = await this.form.findElement(
      By.css(`input[name="${name}"]`)
    );
    await element.sendKeys(value);
  }

  async resetTextareaField(name: string, value: string) {
    const element = await this.form.findElement(
      By.css(`textarea[name="${name}"]`)
    );
    await element.click();
    await element.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    await element.sendKeys(value);
  }

  async setTextareaField(name: string, value: string) {
    const element = await this.form.findElement(
      By.css(`textarea[name="${name}"]`)
    );
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

    await this.helper.waitUntilLoaded();
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

  async waitUntilLoaded() {
    const loadingIndicator = await this.driver.findElement(
      By.css(".spinner-grow")
    );

    await this.driver.wait(
      until.stalenessOf(loadingIndicator),
      10000,
      "waitUntilLoaded"
    );
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
  //await Promise.all([
  // TODO FIXME running in parallel fails to load the modules in firefox. Don't know whats wrong
  await runTest("firefox", testFunction);
  await runTest("chrome", testFunction);
  //]);
}

async function runTest(
  browser: "firefox" | "chrome",
  testFunction: (helper: Helper) => Promise<void>
) {
  await sql`DROP TABLE IF EXISTS settings, sessions, choices_history, projects_history, users_history, choices, users_with_deleted, projects_with_deleted CASCADE;`;
  await sql.begin(async (tsql) => {
    await tsql.file("src/server/setup.sql");
  });
  await setup();

  // https://github.com/mozilla/geckodriver/issues/882
  const builder = new Builder().disableEnvironmentOverrides();

  const prefs = new logging.Preferences();
  prefs.setLevel(logging.Type.BROWSER, logging.Level.DEBUG);

  // https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/logging.html
  installConsoleHandler();
  logging.getLogger().setLevel(logging.Level.ALL);
  logging.getLogger("webdriver.http").setLevel(logging.Level.OFF);
  logging.getLogger("webdriver.http.Executor").setLevel(logging.Level.OFF);

  if (browser === "firefox") {
    builder.withCapabilities(
      Capabilities.firefox()
        .setAcceptInsecureCerts(true)
        .setBrowserName("firefox")
        .setLoggingPrefs(prefs)
    );
  }

  if (browser === "chrome") {
    builder.withCapabilities(
      new Capabilities()
        .setAcceptInsecureCerts(true)
        .setBrowserName("chrome")
        .setLoggingPrefs(prefs)
    );
    //.usingServer("http://localhost:9515");
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
    try {
      // Needed for Chrome. Firefox throws here, will not implement.
      // https://github.com/mozilla/geckodriver/issues/284
      const entries = await driver.manage().logs().get(logging.Type.BROWSER);
      console.log(entries);
      entries.forEach(function (entry) {
        console.log("[%s] %s", entry.level.name, entry.message);
      });
    } catch (error) {
      // ignore
    }

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
  await helper.waitUntilLoaded();
  form = await helper.form("pw-user-create");
  assert.equal(await form.getField("0,username"), username);
  assert.equal(await form.getField("0,openid_id"), email);
  assert.equal(await form.getField("0,group"), group);
  assert.equal(await form.getField("0,age"), `${age}`);
  assert.equal((await form.getCheckboxField("0,away")) === "true", away);
  assert.equal((await form.getCheckboxField("0,deleted")) === "true", deleted);

  const username2 = `username${crypto.getRandomValues(new Uint32Array(1))[0]}`;
  await form.resetField("0,username", username2);
  await form.submitSuccess();

  await helper.click(
    await helper.driver.findElement(By.css(`button[class="btn btn-secondary"]`))
  );

  form = await helper.form("pw-users");

  await form.setField("filters,id", id);
  await form.setField("filters,username", username2);

  await helper.waitUntilLoaded();

  // click view button
  await helper.click(await helper.driver.findElement(By.css(`td p a`)));

  form = await helper.form("pw-user-create");
  assert.equal(await form.getField("0,username"), username2);
  assert.equal(await form.getField("0,openid_id"), email);
  assert.equal(await form.getField("0,group"), group);
  assert.equal(await form.getField("0,age"), `${age}`);
  assert.equal((await form.getCheckboxField("0,away")) === "true", away);
  assert.equal((await form.getCheckboxField("0,deleted")) === "true", deleted);

  // click edit button
  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/users/edit/${id}"]`))
  );
  await helper.waitUntilLoaded();

  form = await helper.form("pw-user-create");

  await form.resetField("0,username", "");
  await form.resetField("0,openid_id", "");
  await form.resetField("0,group", "");
  await form.resetField("0,age", "");
  await form.checkField("0,away", false);
  await form.checkField("0,deleted", false);
  assert.deepStrictEqual(
    [["0,username", "Text muss mindestens 1 Zeichen haben"]],
    await form.submitFailure()
  );

  await form.setField("0,username", username);
  await form.submitSuccess();

  form = await helper.form("pw-user-create");
  assert.equal(await form.getField("0,username"), username);
  assert.equal(await form.getField("0,openid_id"), "");
  assert.equal(await form.getField("0,group"), "");
  assert.equal(await form.getField("0,age"), "");
  assert.equal((await form.getCheckboxField("0,away")) === "true", false);
  assert.equal((await form.getCheckboxField("0,deleted")) === "true", false);
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
  await helper.waitUntilLoaded();
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
  await form.resetField("title", title2);

  await form.submitSuccess();

  await helper.click(
    await helper.driver.findElement(By.css(`button[class="btn btn-secondary"]`))
  );

  form = await helper.form("pw-projects");

  await form.setField("filters,id", id);
  await form.setField("filters,title", title2);

  await helper.waitUntilLoaded();

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

  // click edit button
  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/projects/edit/${id}"]`))
  );
  await helper.waitUntilLoaded();

  form = await helper.form("pw-project-create");

  await form.resetField("title", "");
  await form.resetTextareaField("info", "");
  await form.resetField("place", "");
  await form.resetField("costs", "");
  await form.resetField("min_age", "");
  await form.resetField("max_age", "");
  await form.resetField("min_participants", "");
  await form.resetField("max_participants", "");
  await form.checkField("random_assignments", false);
  await form.checkField("deleted", false);
  await form.submitSuccess();

  form = await helper.form("pw-project-create");
  assert.equal(await form.getField("title"), "");
  assert.equal(await form.getField("info"), "");
  assert.equal(await form.getField("place"), "");
  assert.equal(await form.getField("costs"), "");
  assert.equal(await form.getField("min_age"), "");
  assert.equal(await form.getField("max_age"), "");
  assert.equal(await form.getField("min_participants"), "");
  assert.equal(await form.getField("max_participants"), "");
  assert.equal(
    (await form.getCheckboxField("random_assignments")) === "true",
    false
  );
  assert.equal((await form.getCheckboxField("deleted")) === "true", false);
}

async function checkNotLoggedInUsers(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/users`);

  const alert = await helper.driver.wait(
    until.elementLocated(By.css('div[class="alert alert-danger"]')),
    5000,
    "Expected submit failure 2"
  );

  assert.match(await alert.getText(), /Nicht angemeldet!/);
}

async function checkNotLoggedInProjects(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/projects`);

  const alert = await helper.driver.wait(
    until.elementLocated(By.css('div[class="alert alert-danger"]')),
    5000,
    "Expected submit failure 3"
  );

  assert.match(await alert.getText(), /Nicht angemeldet!/);
}

const randomFromArray = function <T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
};

async function checkProjectSortingWorks(helper: Helper) {
  for (let j = 0; j < 5; j++) {
    await loginCorrect(helper);
    await helper.openNavbar();

    await helper.click(
      await helper.driver.findElement(By.css(`a[href="/projects"]`))
    );
    await helper.form("pw-projects");

    for (let i = 0; i < Math.random() * 10; i++) {
      const randomOrderButton = randomFromArray(
        await helper.driver.findElements(By.css("pw-order button"))
      );
      await randomOrderButton.click();
    }

    const rows = [];

    for (;;) {
      await helper.waitUntilLoaded();

      const thisRows = await helper.driver.findElements(
        By.css('tbody tr th[scope="row"]')
      );
      const thisRowsText = await Promise.all(
        thisRows.map((r) => r.getText().then((v) => Number(v)))
      );

      console.log(thisRowsText);

      rows.push(...thisRowsText);

      const nextPage = await helper.driver.findElement(
        By.css('a[aria-label="next page"]')
      );

      if (!((await nextPage.getAttribute("aria-disabled")) === "false")) {
        break;
      }

      await helper.click(nextPage);
    }

    console.log("end");

    // TODO FIXME reset database before every run so this works
    assert.equal(100, rows.length);

    console.log(rows.sort((a, b) => a - b));

    assert.deepEqual(
      Array.from({ length: rows.length }, (_, i) => i + 1),
      rows
    );
  }
}

async function checkUsersSortingWorks(helper: Helper) {
  await loginCorrect(helper);
  await helper.openNavbar();

  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/users"]`))
  );
  await helper.form("pw-users");

  for (let i = 0; i < Math.random() * 10; i++) {
    const randomOrderButton = randomFromArray(
      await helper.driver.findElements(By.css("pw-order button"))
    );
    await randomOrderButton.click();
  }

  const rows = [];

  for (;;) {
    await helper.waitUntilLoaded();

    const thisRows = await helper.driver.findElements(
      By.css('tbody tr th[scope="row"]')
    );
    const thisRowsText = await Promise.all(
      thisRows.map((r) => r.getText().then((v) => Number(v)))
    );

    console.log(thisRowsText);

    rows.push(...thisRowsText);

    const nextPage = await helper.driver.findElement(
      By.css('a[aria-label="next page"]')
    );

    if (!((await nextPage.getAttribute("aria-disabled")) === "false")) {
      break;
    }

    await helper.click(nextPage);
  }

  console.log("end");

  // TODO FIXME reset database before every run so this works
  assert.equal(501, rows.length);

  console.log(rows.sort((a, b) => a - b));

  assert.deepEqual(
    Array.from({ length: rows.length }, (_, i) => i + 1),
    rows
  );
}

async function checkUsersPaginationLimitWorks(helper: Helper) {
  for (const entityType of ["users", "projects"]) {
    await loginCorrect(helper);
    await helper.openNavbar();

    await helper.click(
      await helper.driver.findElement(By.css(`a[href="/${entityType}"]`))
    );
    await helper.form(`pw-${entityType}`);

    await (
      await helper.driver.findElement(
        By.css('select[name="paginationLimit"] option[value="100"]')
      )
    ).click();

    const rows = [];

    for (;;) {
      await helper.waitUntilLoaded();

      const thisRows = await helper.driver.findElements(
        By.css('tbody tr th[scope="row"]')
      );
      const thisRowsText = await Promise.all(
        thisRows.map((r) => r.getText().then((v) => Number(v)))
      );

      assert.ok(thisRowsText.length <= 100);

      console.log(thisRowsText);

      rows.push(...thisRowsText);

      const nextPage = await helper.driver.findElement(
        By.css('a[aria-label="next page"]')
      );

      if (!((await nextPage.getAttribute("aria-disabled")) === "false")) {
        break;
      }

      await helper.click(nextPage);
    }

    console.log("end");

    assert.equal(entityType === "users" ? 501 : 100, rows.length);

    console.log(rows.sort((a, b) => a - b));

    assert.deepEqual(
      Array.from({ length: rows.length }, (_, i) => i + 1),
      rows
    );
  }
}

async function checkUsersFilteringWorks(helper: Helper) {
  await loginCorrect(helper);
  await helper.openNavbar();

  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/users"]`))
  );
  await helper.form("pw-users");

  await (
    await helper.driver.findElement(
      By.css('select[name="filters,type"] option[value="admin"]')
    )
  ).click();

  const rows = [];

  await helper.waitUntilLoaded();

  const thisRows = await helper.driver.findElements(
    By.css('tbody tr th[scope="row"]')
  );
  const thisRowsText = await Promise.all(
    thisRows.map((r) => r.getText().then((v) => Number(v)))
  );

  console.log(thisRowsText);

  rows.push(...thisRowsText);

  console.log("end");

  assert.equal(1, rows.length);

  console.log(rows.sort((a, b) => a - b));

  assert.deepEqual(
    Array.from({ length: rows.length }, (_, i) => i + 1),
    rows
  );
}

async function resettingUserWorks(helper: Helper) {
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
  await helper.waitUntilLoaded();
  form = await helper.form("pw-user-create");

  // clear all fields (TODO set to random values (also empty))
  await form.resetField("0,username", "");
  await form.resetField("0,openid_id", "");
  await form.resetField("0,group", "");
  await form.resetField("0,age", "");
  await form.checkField("0,away", false);
  await form.checkField("0,deleted", false);

  // TODO click all reset buttons
  await Promise.all(
    (
      await helper.driver.findElements(
        By.css('button[class="btn btn-outline-secondary"]')
      )
    ).map((elem) => {
      elem.click();
    })
  );

  // check what resetting worked
  form = await helper.form("pw-user-create");
  assert.equal(await form.getField("0,username"), username);
  assert.equal(await form.getField("0,openid_id"), email);
  assert.equal(await form.getField("0,group"), group);
  assert.equal(await form.getField("0,age"), `${age}`);
  assert.equal((await form.getCheckboxField("0,away")) === "true", away);
  assert.equal((await form.getCheckboxField("0,deleted")) === "true", deleted);
}

// TODO better would be some kind of queing system where a ready browser takes the next task

await runTestAllBrowsers(async (helper) => {
  await resettingUserWorks(helper);
  await helper.driver.manage().deleteAllCookies();

  return;

  await checkUsersFilteringWorks(helper);
  await helper.driver.manage().deleteAllCookies();

  await checkUsersPaginationLimitWorks(helper);
  await helper.driver.manage().deleteAllCookies();

  await checkProjectSortingWorks(helper);
  await helper.driver.manage().deleteAllCookies();

  await checkUsersSortingWorks(helper);
  await helper.driver.manage().deleteAllCookies();

  await createProjectAllFields(helper);
  await helper.driver.manage().deleteAllCookies();

  await createUserAllFields(helper);
  await helper.driver.manage().deleteAllCookies();

  await loginEmptyUsernameAndPassword(helper);
  await helper.driver.manage().deleteAllCookies();

  await loginWrongUsername(helper);
  await helper.driver.manage().deleteAllCookies();

  await loginEmptyPassword(helper);
  await helper.driver.manage().deleteAllCookies();

  await loginEmptyUsername(helper);
  await helper.driver.manage().deleteAllCookies();

  await loginWrongPassword(helper);
  await helper.driver.manage().deleteAllCookies();

  await loginCorrect(helper);
  await helper.driver.manage().deleteAllCookies();

  await welcomeWorks(helper);
  await helper.driver.manage().deleteAllCookies();

  await imprintWorks(helper);
  await helper.driver.manage().deleteAllCookies();

  await privacyWorks(helper);
  await helper.driver.manage().deleteAllCookies();

  await logoutWorks(helper);
  await helper.driver.manage().deleteAllCookies();

  await checkNotLoggedInUsers(helper);
  await helper.driver.manage().deleteAllCookies();

  await checkNotLoggedInProjects(helper);
  await helper.driver.manage().deleteAllCookies();
});

await sql.end();
