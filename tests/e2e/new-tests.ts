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
import { exec as unpromisifiedExec } from "child_process";
import { writeFile } from "fs/promises";
import nodeCrypto from "node:crypto";
import { promisify } from "node:util";
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
import { Chance } from "chance";
import { argv } from "process";

let chance: Chance.Chance;

const exec = promisify(unpromisifiedExec);

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
    await this.helper.ensureNothingLoading();
    const element = await this.form.findElement(
      By.css(`input[name="${name}"]`)
    );
    // really? https://github.com/w3c/webdriver/issues/1630
    await element.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    await element.sendKeys(value);
  }

  async setField(name: string, value: string) {
    await this.helper.ensureNothingLoading();
    const element = await this.form.findElement(
      By.css(`input[name="${name}"]`)
    );
    await element.sendKeys(value);
  }

  async resetTextareaField(name: string, value: string) {
    await this.helper.ensureNothingLoading();
    const element = await this.form.findElement(
      By.css(`textarea[name="${name}"]`)
    );
    await element.click();
    await element.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    await element.sendKeys(value);
  }

  async setTextareaField(name: string, value: string) {
    await this.helper.ensureNothingLoading();
    const element = await this.form.findElement(
      By.css(`textarea[name="${name}"]`)
    );
    await element.click();
    await element.sendKeys(value);
  }

  async checkField(name: string, value: boolean) {
    await this.helper.ensureNothingLoading();
    const element = await this.form.findElement(
      By.css(`input[name="${name}"]`)
    );
    if ((await element.isSelected()) != value) {
      await this.helper.click(element);
    }
  }

  async getField(name: string) {
    await this.helper.ensureNothingLoading();
    const element = await this.form.findElement(By.css(`*[name="${name}"]`));
    return await element.getAttribute("value");
  }

  async getCheckboxField(name: string) {
    await this.helper.ensureNothingLoading();
    const element = await this.form.findElement(
      By.css(`input[name="${name}"]`)
    );
    return await element.isSelected();
  }

  private async submit() {
    await this.helper.ensureNothingLoading();
    const submitButton = await this.form.findElement(
      By.css('button[type="submit"]')
    );

    await this.helper.click(submitButton);

    await this.helper.waitUntilLoaded();
  }

  async submitSuccess() {
    await this.helper.ensureNothingLoading();
    await this.submit();

    const alerts = await this.helper.driver.findElements(
      By.css('div[class="alert alert-danger"]')
    );

    assert.deepEqual(alerts, []);

    await this.helper.waitUntilLoaded();
  }

  async submitFailure() {
    await this.helper.ensureNothingLoading();
    await this.submit();

    const alert = await this.helper.driver.findElement(
      By.css('div[class="alert alert-danger"]')
    );

    assert.match(await alert.getText(), /Some errors occurred./);
    await this.helper.waitUntilLoaded();
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

  async ensureNothingLoading() {
    try {
      await this.driver.findElement(By.css(".spinner-grow"));
    } catch (error) {
      return;
    }
    throw new Error("something is still loading. This may be a bug");
  }

  async click(element: WebElement) {
    await this.ensureNothingLoading();
    await this.driver.executeScript(`arguments[0].click()`, element);
  }

  async waitUntilLoaded() {
    try {
      const loadingIndicators = await this.driver.findElements(
        By.css(".spinner-grow")
      );

      await Promise.all(
        loadingIndicators.map((e) =>
          this.driver.wait(until.stalenessOf(e), 10000, "waitUntilLoaded")
        )
      );
    } catch (error) {
      throw new Error("spinner-grow failed");
    }
  }

  async waitElem(name: string) {
    return await this.driver.wait(
      until.elementLocated(By.css(name)),
      2000,
      `Element ${name} not found`
    );
  }

  async form(name: string) {
    const formElement = await this.waitElem(name);
    await this.waitUntilLoaded();
    return new FormTester(this, formElement);
  }

  async openNavbar() {
    await this.ensureNothingLoading();
    const navbarButton = this.driver.findElement(
      By.css("button.navbar-toggler")
    );

    await this.click(navbarButton);
  }
}

async function runTest(
  browser: "firefox" | "chrome",
  testFunction: (helper: Helper) => Promise<void>
) {
  chance = new Chance(1234);
  console.log("1");
  console.log(
    (
      await exec(
        'psql postgres://projektwahl_staging_admin:projektwahl@localhost/projektwahl_staging --command="DROP TABLE IF EXISTS settings, sessions, choices_history, projects_history, users_history, choices, users_with_deleted, projects_with_deleted CASCADE;"',
        {
          maxBuffer: 1000 * 1000 * 1000,
        }
      )
    ).stderr
  );
  console.log("2");
  console.log(
    (
      await exec(
        "psql postgres://projektwahl_staging_admin:projektwahl@localhost/projektwahl_staging --single-transaction < src/server/setup.sql"
      )
    ).stderr
  );
  console.log("3");
  console.log(
    (
      await exec(`psql postgres://projektwahl:projektwahl@localhost/projektwahl_staging --command="ALTER DATABASE projektwahl_staging SET default_transaction_isolation = 'serializable';
  GRANT SELECT,INSERT,UPDATE ON users_with_deleted TO projektwahl_staging;
  GRANT SELECT,INSERT,UPDATE ON users TO projektwahl_staging;
  GRANT SELECT,INSERT,UPDATE ON projects_with_deleted TO projektwahl_staging;
  GRANT SELECT,INSERT,UPDATE ON projects TO projektwahl_staging;
  GRANT SELECT,INSERT,UPDATE,DELETE ON choices TO projektwahl_staging;
  GRANT INSERT ON settings TO projektwahl_staging;
  GRANT SELECT,INSERT,UPDATE,DELETE ON sessions TO projektwahl_staging;
  ALTER VIEW users OWNER TO projektwahl_staging;
  ALTER VIEW present_voters OWNER TO projektwahl_staging;
  ALTER VIEW projects OWNER TO projektwahl_staging;"`)
    ).stderr
  );
  console.log("4");
  console.log(
    (
      await exec(
        "NODE_ENV=development DATABASE_HOST=localhost DATABASE_URL=postgres://projektwahl_staging:projektwahl@localhost/projektwahl_staging npm run setup",
        {
          maxBuffer: 1000 * 1000 * 1000,
        }
      )
    ).stderr
  );
  console.log("5");

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
    /*try {
      // Needed for Chrome. Firefox throws here, will not implement.
      // https://github.com/mozilla/geckodriver/issues/284
      const entries = await driver.manage().logs().get(logging.Type.BROWSER);
      console.log(entries);
      entries.forEach(function (entry) {
        console.log("[%s] %s", entry.level.name, entry.message);
      });
    } catch (error) {
      // ignore
    }*/

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
    /Projektwoche/
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
  const email = `email${chance.integer()}`.substring(0, 15);
  const group = `group${chance.integer()}`.substring(0, 15);
  const age = chance.integer({ min: 0, max: 10 });
  const away = chance.bool();
  const deleted = chance.bool();
  await form.setField("0,username", username);
  await form.setField("0,openid_id", email);
  await form.setField("0,group", group);
  await form.setField("0,age", `${age}`);
  await form.checkField("0,away", away);
  await form.checkField("0,deleted", deleted);
  await form.submitSuccess();
  await helper.driver.wait(until.urlContains("/users/edit/"), 2000);
  const id = (await helper.driver.getCurrentUrl()).match(
    /\/users\/edit\/(\d+)/
  )?.[1];
  if (!id) {
    assert.fail("id not found in url");
  }
  await helper.waitUntilLoaded();
  form = await helper.form("pw-user-create");
  await helper.waitUntilLoaded();
  assert.equal(await form.getField("0,username"), username);
  assert.equal(await form.getField("0,openid_id"), email);
  assert.equal(await form.getField("0,group"), group);
  assert.equal(await form.getField("0,age"), `${age}`);
  assert.equal(await form.getCheckboxField("0,away"), away);
  assert.equal(await form.getCheckboxField("0,deleted"), deleted);

  const username2 = `username${crypto.getRandomValues(new Uint32Array(1))[0]}`;
  await form.resetField("0,username", username2);
  await form.submitSuccess();

  // back
  await helper.click(
    await helper.driver.findElement(By.css(`button[class="btn btn-secondary"]`))
  );

  form = await helper.form("pw-users");

  await form.checkField("filters,deleted", true);
  await helper.waitUntilLoaded();
  await form.setField("filters,id", id);
  await helper.waitUntilLoaded();
  await form.setField("filters,username", username2);

  await helper.waitUntilLoaded();

  // click view button
  await helper.click(await helper.driver.findElement(By.css(`td p a`)));

  form = await helper.form("pw-user-create");
  await helper.waitUntilLoaded();

  assert.equal(await form.getField("0,username"), username2);
  assert.equal(await form.getField("0,openid_id"), email);
  assert.equal(await form.getField("0,group"), group);
  assert.equal(await form.getField("0,age"), `${age}`);
  assert.equal(await form.getCheckboxField("0,away"), away);
  assert.equal(await form.getCheckboxField("0,deleted"), deleted);

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

  await helper.driver.sleep(1000);

  assert.equal(await form.getField("0,username"), username);
  assert.equal(await form.getField("0,openid_id"), "");
  assert.equal(await form.getField("0,group"), "");
  assert.equal(await form.getField("0,age"), "");
  assert.equal(await form.getCheckboxField("0,away"), false);
  assert.equal(await form.getCheckboxField("0,deleted"), false);
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
  const title = `title${chance.integer()}`;
  const info = `info${chance.integer()}`;
  const place = `place${chance.integer()}`;
  const costs = chance.integer({ min: 0, max: 10 });
  const min_age = chance.integer({ min: 0, max: 10 });
  const max_age = chance.integer({ min: 0, max: 10 });
  const min_participants = chance.integer({ min: 1, max: 10 });
  const max_participants = chance.integer({ min: 1, max: 10 });
  const random_assignments = chance.bool();
  const deleted = chance.bool();
  await form.setField("title", title);
  await form.setTextareaField("info", info);
  await form.setField("place", place);
  await form.resetField("costs", `${costs}`);
  await form.resetField("min_age", `${min_age}`);
  await form.resetField("max_age", `${max_age}`);
  await form.resetField("min_participants", `${min_participants}`);
  await form.resetField("max_participants", `${max_participants}`);
  await form.checkField("random_assignments", random_assignments);
  await form.checkField("deleted", deleted);
  await form.submitSuccess();
  await helper.driver.wait(until.urlContains("/projects/edit/"), 2000);
  const id = (await helper.driver.getCurrentUrl()).match(
    /\/projects\/edit\/(\d+)/
  )?.[1];
  if (!id) {
    assert.fail("id not found in url");
  }
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
    await form.getCheckboxField("random_assignments"),
    random_assignments
  );
  assert.equal(await form.getCheckboxField("deleted"), deleted);

  const title2 = `title${chance.integer()}`;
  await form.resetField("title", title2);

  await form.submitSuccess();

  await helper.click(
    await helper.driver.findElement(By.css(`button[class="btn btn-secondary"]`))
  );

  form = await helper.form("pw-projects");

  await form.checkField("filters,deleted", true);
  await helper.waitUntilLoaded();
  await form.setField("filters,id", id);
  await helper.waitUntilLoaded();

  await form.setField("filters,title", title2);

  await helper.waitUntilLoaded();

  // click view button
  await helper.click(await helper.driver.findElement(By.css(`td p a`)));

  form = await helper.form("pw-project-create");

  await helper.waitUntilLoaded();

  assert.equal(await form.getField("title"), title2);
  assert.equal(await form.getField("info"), info);
  assert.equal(await form.getField("place"), place);
  assert.equal(await form.getField("costs"), `${costs}`);
  assert.equal(await form.getField("min_age"), `${min_age}`);
  assert.equal(await form.getField("max_age"), `${max_age}`);
  assert.equal(await form.getField("min_participants"), `${min_participants}`);
  assert.equal(await form.getField("max_participants"), `${max_participants}`);
  assert.equal(
    await form.getCheckboxField("random_assignments"),
    random_assignments
  );
  assert.equal(await form.getCheckboxField("deleted"), deleted);

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
  // defaults
  assert.equal(await form.getField("costs"), "0");
  assert.equal(await form.getField("min_age"), "5");
  assert.equal(await form.getField("max_age"), "13");
  assert.equal(await form.getField("min_participants"), "5");
  assert.equal(await form.getField("max_participants"), "15");
  assert.equal(await form.getCheckboxField("random_assignments"), false);
  assert.equal(await form.getCheckboxField("deleted"), false);
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
  return array[chance.integer({ min: 0, max: array.length - 1 })];
};

async function checkProjectSortingWorks(helper: Helper) {
  for (let j = 0; j < 5; j++) {
    await loginCorrect(helper);
    await helper.openNavbar();

    await helper.click(
      await helper.driver.findElement(By.css(`a[href="/projects"]`))
    );
    await helper.form("pw-projects");

    for (let i = 0; i < chance.integer({ min: 1, max: 10 }); i++) {
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

  for (let i = 0; i < chance.integer({ min: 1, max: 10 }); i++) {
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

  console.log(rows.sort((a, b) => a - b));

  assert.deepEqual(
    Array.from({ length: rows.length }, (_, i) => i + 1),
    rows
  );

  assert.equal(501, rows.length);
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
        By.css('select[name="paginationLimit"] option[value="50"]')
      )
    ).click();

    await helper.waitUntilLoaded();

    for (const direction of ["next", "previous"]) {
      const rows = [];

      for (;;) {
        const thisRows = await helper.driver.findElements(
          By.css('tbody tr th[scope="row"]')
        );
        const thisRowsText = await Promise.all(
          thisRows.map((r) => r.getText().then((v) => Number(v)))
        );

        assert.ok(thisRowsText.length <= 50);

        console.log(thisRowsText);

        rows.push(...thisRowsText);

        const nextPage = await helper.driver.findElement(
          By.css(`a[aria-label="${direction} page"]`)
        );

        if (!((await nextPage.getAttribute("aria-disabled")) === "false")) {
          break;
        }

        await helper.click(nextPage);

        await helper.waitUntilLoaded();
      }

      console.log("end");

      console.log(rows.sort((a, b) => a - b));

      assert.deepEqual(
        Array.from({ length: rows.length }, (_, i) => i + 1),
        rows
      );

      assert.equal(entityType === "users" ? 501 : 100, rows.length);
    }
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
  const username = `username${chance.integer()}`;
  const email = `email${chance.integer()}`.substring(0, 15);
  const away = chance.bool();
  const deleted = chance.bool();
  await form.setField("0,username", username);
  await form.setField("0,openid_id", email);

  await (
    await helper.driver.findElement(
      By.css('select[name="0,type"] option[value="admin"]')
    )
  ).click();

  await form.checkField("0,away", away);
  await form.checkField("0,deleted", deleted);
  await form.submitSuccess();
  await helper.driver.wait(until.urlContains("/users/edit/"), 2000);
  (await helper.driver.getCurrentUrl()).substring(
    "https://localhost:8443/users/edit/".length
  );
  await helper.waitUntilLoaded();
  form = await helper.form("pw-user-create");

  // clear all fields (TODO set to random values (also empty))
  await form.resetField("0,username", "");
  await form.resetField("0,openid_id", "");
  await (
    await helper.driver.findElement(
      By.css('select[name="0,type"] option[value="helper"]')
    )
  ).click();
  await form.checkField("0,away", false);
  await form.checkField("0,deleted", false);

  // TODO click all reset buttons
  await Promise.all(
    (
      await helper.driver.findElements(
        By.css('div button[class="btn btn-outline-secondary"]')
      )
    ).map((elem) => helper.click(elem))
  );

  // check what resetting worked
  form = await helper.form("pw-user-create");
  assert.equal(await form.getField("0,username"), username);
  assert.equal(await form.getField("0,openid_id"), email);
  assert.equal(await form.getField("0,type"), "admin");
  assert.equal(await form.getCheckboxField("0,away"), away);
  console.log(await form.getCheckboxField("0,deleted"));
  assert.equal(await form.getCheckboxField("0,deleted"), deleted);
}

async function resettingProjectWorks(helper: Helper) {
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
  const title = `title${chance.integer()}`;
  const info = `info${chance.integer()}`;
  const place = `place${chance.integer()}`;
  const costs = chance.integer({ min: 0, max: 10 });
  const min_age = chance.integer({ min: 0, max: 10 });
  const max_age = chance.integer({ min: 0, max: 10 });
  const min_participants = chance.integer({ min: 1, max: 10 });
  const max_participants = chance.integer({ min: 1, max: 10 });
  const random_assignments = chance.bool();
  const deleted = chance.bool();
  await form.setField("title", title);
  await form.setTextareaField("info", info);
  await form.setField("place", place);
  await form.resetField("costs", `${costs}`);
  await form.resetField("min_age", `${min_age}`);
  await form.resetField("max_age", `${max_age}`);
  await form.resetField("min_participants", `${min_participants}`);
  await form.resetField("max_participants", `${max_participants}`);
  await form.checkField("random_assignments", random_assignments);
  await form.checkField("deleted", deleted);
  await form.submitSuccess();
  await helper.driver.wait(until.urlContains("/projects/edit/"), 2000);
  (await helper.driver.getCurrentUrl()).substring(
    "https://localhost:8443/projects/edit/".length
  );
  await helper.waitUntilLoaded();
  form = await helper.form("pw-project-create");

  // clear all fields (TODO set to random values (also empty))
  await form.resetField("title", "");
  await form.resetTextareaField("info", "");
  await form.resetField("place", "");
  await form.resetField("costs", ``);
  await form.resetField("min_age", ``);
  await form.resetField("max_age", ``);
  await form.resetField("min_participants", ``);
  await form.resetField("max_participants", ``);
  await form.checkField("random_assignments", false);
  await form.checkField("deleted", false);

  // TODO click all reset buttons
  await Promise.all(
    (
      await helper.driver.findElements(
        By.css('button[class="btn btn-outline-secondary"]')
      )
    ).map((elem) => helper.click(elem))
  );

  // check what resetting worked
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
    await form.getCheckboxField("random_assignments"),
    random_assignments
  );
  assert.equal(await form.getCheckboxField("deleted"), deleted);
}

async function resettingUserWorks2(helper: Helper) {
  for (const doRefresh of [true, false]) {
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
    const email = `email${chance.integer()}`.substring(0, 15);
    const group = `group${chance.integer()}`.substring(0, 15);
    const age = chance.integer({ min: 0, max: 10 });
    const away = chance.bool();
    const deleted = chance.bool();
    await form.setField("0,username", username);
    await form.setField("0,openid_id", email);
    await form.setField("0,group", group);
    await form.setField("0,age", `${age}`);
    await form.checkField("0,away", away);
    await form.checkField("0,deleted", deleted);
    await form.submitSuccess();
    await helper.driver.wait(until.urlContains("/users/edit/"), 2000);
    (await helper.driver.getCurrentUrl()).substring(
      "https://localhost:8443/users/edit/".length
    );
    await helper.waitUntilLoaded();
    form = await helper.form("pw-user-create");

    // clear all fields (TODO set to random values (also empty))
    const username2 = `username${
      crypto.getRandomValues(new Uint32Array(1))[0]
    }`;
    await form.resetField("0,username", username2);
    await form.resetField("0,openid_id", "");
    await form.resetField("0,group", "");
    await form.resetField("0,age", "");
    await form.checkField("0,away", false);
    await form.checkField("0,deleted", false);

    // added
    await form.submitSuccess();

    if (doRefresh) {
      await helper.driver.navigate().refresh();
      form = await helper.form("pw-user-create");
    }

    await helper.waitUntilLoaded();

    // TODO click all reset buttons
    await Promise.all(
      (
        await helper.driver.findElements(
          By.css('div button[class="btn btn-outline-secondary"]')
        )
      ).map((elem) => helper.click(elem))
    );

    await helper.driver.sleep(1000);

    // check what resetting worked
    form = await helper.form("pw-user-create");
    assert.equal(await form.getField("0,username"), username2);
    assert.equal(await form.getField("0,openid_id"), "");
    assert.equal(await form.getField("0,group"), "");
    assert.equal(await form.getField("0,age"), "");
    assert.equal(await form.getCheckboxField("0,away"), false);
    assert.equal(await form.getCheckboxField("0,deleted"), false);
  }
}

async function resettingProjectWorks2(helper: Helper) {
  for (const doRefresh of [false, true]) {
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
    const title = `title${chance.integer()}`;
    const info = `info${chance.integer()}`;
    const place = `place${chance.integer()}`;
    const costs = chance.integer({ min: 0, max: 10 });
    const min_age = chance.integer({ min: 0, max: 10 });
    const max_age = chance.integer({ min: 0, max: 10 });
    const min_participants = chance.integer({ min: 1, max: 10 });
    const max_participants = chance.integer({ min: 1, max: 10 });
    const random_assignments = chance.bool();
    const deleted = chance.bool();
    await form.setField("title", title);
    await form.setTextareaField("info", info);
    await form.setField("place", place);
    await form.resetField("costs", `${costs}`);
    await form.resetField("min_age", `${min_age}`);
    await form.resetField("max_age", `${max_age}`);
    await form.resetField("min_participants", `${min_participants}`);
    await form.resetField("max_participants", `${max_participants}`);
    await form.checkField("random_assignments", random_assignments);
    await form.checkField("deleted", deleted);
    await form.submitSuccess();
    await helper.driver.wait(until.urlContains("/projects/edit/"), 2000);
    (await helper.driver.getCurrentUrl()).substring(
      "https://localhost:8443/projects/edit/".length
    );
    await helper.waitUntilLoaded();
    form = await helper.form("pw-project-create");

    // clear all fields (TODO set to random values (also empty))
    await form.resetField("title", "");
    await form.resetTextareaField("info", "");
    await form.resetField("place", "");
    await form.resetField("costs", ``);
    await form.resetField("min_age", ``);
    await form.resetField("max_age", ``);
    await form.resetField("min_participants", ``);
    await form.resetField("max_participants", ``);
    await form.checkField("random_assignments", false);
    await form.checkField("deleted", false);

    // added
    await form.submitSuccess();

    if (doRefresh) {
      await helper.driver.navigate().refresh();
      form = await helper.form("pw-project-create");
    }

    await helper.waitUntilLoaded();

    // TODO click all reset buttons
    await Promise.all(
      (
        await helper.driver.findElements(
          By.css('div button[class="btn btn-outline-secondary"]')
        )
      ).map((elem) => helper.click(elem))
    );

    await helper.driver.sleep(1000);

    // check what resetting worked
    form = await helper.form("pw-project-create");
    assert.equal(await form.getField("title"), "");
    assert.equal(await form.getField("info"), "");
    assert.equal(await form.getField("place"), "");
    // defaults
    assert.equal(await form.getField("costs"), "0");
    assert.equal(await form.getField("min_age"), "5");
    assert.equal(await form.getField("max_age"), "13");
    assert.equal(await form.getField("min_participants"), "5");
    assert.equal(await form.getField("max_participants"), "15");
    assert.equal(await form.getCheckboxField("random_assignments"), false);
    assert.equal(await form.getCheckboxField("deleted"), false);
  }
}

async function checkUserOrProjectNotFound(helper: Helper) {
  await loginCorrect(helper);

  await helper.driver.get(`${BASE_URL}/projects/edit/34234`);

  await helper.waitUntilLoaded();

  const alert1 = await helper.driver.findElement(
    By.css('div[class="alert alert-danger"]')
  );

  assert.match(await alert1.getText(), /Projekt nicht gefunden!/);

  await helper.driver.get(`${BASE_URL}/users/edit/34234`);

  await helper.waitUntilLoaded();

  const alert2 = await helper.driver.findElement(
    By.css('div[class="alert alert-danger"]')
  );

  assert.match(await alert2.getText(), /Account nicht gefunden!/);
}

async function testVotingWorks(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/login`);
  const formTester = await helper.form("pw-login");
  await formTester.setField("username", "Dr. Dustin Allison M.D.");
  await formTester.setField("password", "changeme");
  await formTester.submitSuccess();

  await helper.openNavbar();
  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/vote"]`))
  );

  await helper.waitUntilLoaded();
  await helper.waitUntilLoaded();

  await helper.click(
    helper.driver.findElement(
      By.xpath(
        `//th/p/a[@href="/projects/view/${4}"]/../../../td/pw-rank-select/form/div/button[1]`
      )
    )
  );

  await helper.waitUntilLoaded();
  await helper.waitUntilLoaded();
  await helper.waitUntilLoaded();

  const alerts1 = await helper.driver.findElements(
    By.css('div[class="alert alert-danger"]')
  );

  assert.equal(alerts1.length, 0);

  await helper.click(
    helper.driver.findElement(
      By.xpath(
        `//th/p/a[@href="/projects/view/${2}"]/../../../td/pw-rank-select/form/div/button[1]`
      )
    )
  );

  await helper.driver.sleep(1000);

  await helper.waitUntilLoaded();
  await helper.waitUntilLoaded();

  const alerts2 = await helper.driver.findElements(
    By.css('div[class="alert alert-danger"]')
  );

  assert.equal(alerts2.length, 1);

  assert.equal(
    await alerts2[0].getText(),
    "Some errors occurred!\n" +
      "database: Der Nutzer passt nicht in die Altersbegrenzung des Projekts!"
  );
}

async function testHelperCreatesProjectWithProjectLeadersAndMembers(
  helper: Helper
) {
  await helper.driver.get(`${BASE_URL}/login`);
  const formTester = await helper.form("pw-login");
  await formTester.setField("username", "Mr. Jerry Howard B.TECH");
  await formTester.setField("password", "changeme");
  await formTester.submitSuccess();

  await helper.openNavbar();
  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/projects"]`))
  );

  await helper.form("pw-projects");
  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/projects/create"]`))
  );
  let form = await helper.form("pw-project-create");
  const title = `title${chance.integer()}`;
  const info = `info${chance.integer()}`;
  const place = `place${chance.integer()}`;
  const costs = chance.integer({ min: 0, max: 10 });
  const min_age = chance.integer({ min: 0, max: 10 });
  const max_age = chance.integer({ min: 0, max: 10 });
  const min_participants = chance.integer({ min: 1, max: 10 });
  const max_participants = chance.integer({ min: 1, max: 10 });
  const random_assignments = chance.bool();
  const deleted = chance.bool();
  await form.setField("title", title);
  await form.setTextareaField("info", info);
  await form.setField("place", place);
  await form.resetField("costs", `${costs}`);
  await form.resetField("min_age", `${min_age}`);
  await form.resetField("max_age", `${max_age}`);
  await form.resetField("min_participants", `${min_participants}`);
  await form.resetField("max_participants", `${max_participants}`);
  await form.checkField("random_assignments", random_assignments);
  await form.checkField("deleted", deleted);
  await form.submitSuccess();
  await helper.driver.wait(until.urlContains("/projects/edit/"), 2000);
  (await helper.driver.getCurrentUrl()).substring(
    "https://localhost:8443/projects/edit/".length
  );
  await helper.waitUntilLoaded();
  form = await helper.form("pw-project-create");

  await helper.driver.sleep(5000);
  //await helper.waitUntilLoaded();
  //await helper.waitUntilLoaded();

  await helper.click(
    await helper.driver.wait(
      until.elementLocated(
        By.xpath(
          `//th/p/a[@href="/users/view/${2}"]/../../../td/pw-project-user-checkbox/form/input`
        )
      ),
      1000
    )
  );

  await helper.waitUntilLoaded();

  const alerts1 = await helper.driver.findElements(
    By.css('div[class="alert alert-danger"]')
  );

  assert.equal(alerts1.length, 0);

  // this is a new project so nobody has voted it yet so obviously there can't be any collisions

  // but we can try to add another teacher
  await helper.click(
    await helper.driver.wait(
      until.elementLocated(
        By.xpath(
          `//th/p/a[@href="/users/view/${4}"]/../../../td/pw-project-user-checkbox/form/input`
        )
      ),
      1000
    )
  );

  await helper.driver.sleep(1000);

  await helper.waitUntilLoaded();

  const alerts2 = await helper.driver.findElements(
    By.css('div[class="alert alert-danger"]')
  );

  assert.equal(alerts2.length, 1);
}

async function checkSettingEmptyPasswordFails(helper: Helper) {
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

  await (
    await helper.driver.findElement(
      By.css('select[name="0,type"] option[value="helper"]')
    )
  ).click();

  await form.setField("0,username", username);
  await form.submitSuccess();
  await helper.driver.wait(until.urlContains("/users/edit/"), 2000);
  const id = (await helper.driver.getCurrentUrl()).match(
    /\/users\/edit\/(\d+)/
  )?.[1];
  if (!id) {
    assert.fail("id not found in url");
  }
  await helper.waitUntilLoaded();

  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/logout"]`))
  );
  await helper.form("pw-login");
  form = await helper.form("pw-login");
  await form.setField("username", username);
  await form.setField("password", "");

  assert.deepStrictEqual(
    [["password", "Kein Password für Account gesetzt!"]],
    await form.submitFailure()
  );

  await loginCorrect(helper);

  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/users"]`))
  );
  form = await helper.form("pw-users");
  await form.setField("filters,id", id);
  await helper.waitUntilLoaded();

  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/users/edit/${id}"]`))
  );
  await helper.waitUntilLoaded();

  form = await helper.form("pw-user-create");
  await helper.waitUntilLoaded();
  await form.resetField("0,password", "hopefullynotsaved");
  await form.resetField("0,password", "");
  await form.submitSuccess();

  await helper.click(
    await helper.driver.findElement(By.css(`a[href="/logout"]`))
  );
  await helper.form("pw-login");
  form = await helper.form("pw-login");
  await form.setField("username", username);
  await form.setField("password", "");

  assert.deepStrictEqual(
    [["password", "Kein Password für Account gesetzt!"]],
    await form.submitFailure()
  );

  await loginCorrect(helper);
}

console.log(argv);

if (argv.length !== 3) {
  throw new Error("provide browser name as second argument");
}

if (argv[2] !== "chrome" && argv[2] !== "firefox") {
  throw new Error("possible browser names: chrome, firefox");
}

await runTest(argv[2], async (helper) => {
  await checkUserOrProjectNotFound(helper);
  await helper.driver.manage().deleteAllCookies();

  await checkUsersSortingWorks(helper);
  await helper.driver.manage().deleteAllCookies();

  await testVotingWorks(helper);
  await helper.driver.manage().deleteAllCookies();

  await checkUsersFilteringWorks(helper);
  await helper.driver.manage().deleteAllCookies();

  await checkUsersPaginationLimitWorks(helper);
  await helper.driver.manage().deleteAllCookies();

  await checkProjectSortingWorks(helper);
  await helper.driver.manage().deleteAllCookies();

  await testHelperCreatesProjectWithProjectLeadersAndMembers(helper);
  await helper.driver.manage().deleteAllCookies();

  await resettingUserWorks2(helper);
  await helper.driver.manage().deleteAllCookies();

  await resettingUserWorks(helper);
  await helper.driver.manage().deleteAllCookies();

  await resettingProjectWorks2(helper);
  await helper.driver.manage().deleteAllCookies();

  await resettingProjectWorks(helper);
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

  // login ratelimiting
  await helper.driver.sleep(5000);

  await loginWrongPassword(helper);
  await helper.driver.manage().deleteAllCookies();

  // login ratelimiting
  await helper.driver.sleep(5000);

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

  // login ratelimiting
  await helper.driver.sleep(5000);

  await checkSettingEmptyPasswordFails(helper);
  await helper.driver.manage().deleteAllCookies();
});

await sql.end();
