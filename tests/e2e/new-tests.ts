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

  private async submit() {
    const submitButton = await (
      await this.helper.shadow(this.form)
    ).findElement(By.css('button[type="submit"]'));

    await this.helper.click(submitButton);
  }

  async submitSuccess() {
    await this.submit();
  }

  async submitFailure() {
    await this.submit();
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

  async shadow(element: WebElement) {
    // @ts-expect-error types are wrong
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions,@typescript-eslint/no-unsafe-call
    return (await element.getShadowRoot()) as WebElement;
  }

  async click(element: WebElement) {
    // currently this is just too buggy

    //await driver.executeScript(`arguments[0].scrollIntoView(true);`, element);

    //await driver.sleep(250);

    await this.driver.executeScript(`arguments[0].click()`, element);
  }

  async getPwAppComponent(name: string) {
    //const pwApp = await this.driver.findElement(By.css("pw-app"));

    //await this.driver.wait(async () => await (await this.shadow(pwApp)).findElement(By.css(name)), 1000, `Could not find pw-app component ${name}`)

  }
}

async function runTest(testFunction: (helper: Helper) => Promise<void>) {
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

export async function loginWrongUsername(helper: Helper) {
  await helper.driver.get(`${BASE_URL}/login`);

  new FormTester(helper, await helper.getPwAppComponent(`pw-login`));
}

void runTest(loginWrongUsername);
