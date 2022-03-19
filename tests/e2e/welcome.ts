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
/*
import { writeFile } from "fs/promises";

import {
  Builder,
  By,
  Capabilities,
  Capability,
  until,
  WebDriver,
} from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import { click, runTest, shadow } from "./new-tests.js";

if (!process.env["BASE_URL"]) {
  console.error("BASE_URL not set!");
  process.exit(1);
}

export async function testUser(driver: WebDriver) {

  {
    // edit user
    const pwApp = await driver.findElement(By.css("pw-app"));

    const accountsLink = await (
      await shadow(pwApp)
    ).findElement(By.css('a[href="/users"]'));

    await click(driver, accountsLink);

    const pwUsers = await (await shadow(pwApp)).findElement(By.css("pw-users"));

    const user2 = await (
      await shadow(pwUsers)
    ).findElement(By.css('a[href="/users/edit/7"]'));

    await click(driver, user2);

    const pwUserCreate = await (
      await shadow(pwApp)
    ).findElement(By.css("pw-user-create"));

    const pwUserGroup = await (
      await shadow(pwUserCreate)
    ).findElement(By.css('input[name="0,group"]'));

    await pwUserGroup.clear();
    await pwUserGroup.sendKeys(groupName);

    const submitButton = await (
      await shadow(pwUserCreate)
    ).findElement(By.css('button[type="submit"]'));

    await click(driver, submitButton);

    await driver.wait(until.urlContains("/users/edit"));
  }


export async function testProject(driver: WebDriver) {
  const randomValue = `${Math.random()}`.substring(0, 10);

  {
    // create project
    const pwApp = await driver.findElement(By.css("pw-app"));

    const accountsLink = await (
      await shadow(pwApp)
    ).findElement(By.css('a[href="/projects"]'));

    await click(driver, accountsLink);

    const pwProjects = await (
      await shadow(pwApp)
    ).findElement(By.css("pw-projects"));

    const projectCreate = await (
      await shadow(pwProjects)
    ).findElement(By.css('a[href="/projects/create"]'));

    await click(driver, projectCreate);

    const pwProjectCreate = await (
      await shadow(pwApp)
    ).findElement(By.css("pw-project-create"));

    {
      const submitButton = await (
        await shadow(pwProjectCreate)
      ).findElement(By.css('button[type="submit"]'));

      await click(driver, submitButton);
    }

    const alert = await (
      await shadow(pwProjectCreate)
    ).findElement(By.css('div[class="alert alert-danger"]'));

    assert.match(await alert.getText(), /Some errors occurred./);

    const feedbacks = await (
      await shadow(pwProjectCreate)
    ).findElements(By.css('div[class="invalid-feedback"]'));

    assert.equal(feedbacks.length, 5);

    {
      const pwUserUsername = await (
        await shadow(pwProjectCreate)
      ).findElement(By.css('input[name="title"]'));

      await pwUserUsername.clear();
      await pwUserUsername.sendKeys(`randomproject${randomValue}`);
    }

    {
      const pwInput = await (
        await shadow(pwProjectCreate)
      ).findElement(By.css('input[name="costs"]'));

      await pwInput.clear();
      await pwInput.sendKeys("10");
    }

    {
      const pwInput = await (
        await shadow(pwProjectCreate)
      ).findElement(By.css('input[name="min_age"]'));

      await pwInput.clear();
      await pwInput.sendKeys("10");
    }

    {
      const pwInput = await (
        await shadow(pwProjectCreate)
      ).findElement(By.css('input[name="max_age"]'));

      await pwInput.clear();
      await pwInput.sendKeys("10");
    }

    {
      const pwInput = await (
        await shadow(pwProjectCreate)
      ).findElement(By.css('input[name="min_participants"]'));

      await pwInput.clear();
      await pwInput.sendKeys("10");
    }

    {
      const pwInput = await (
        await shadow(pwProjectCreate)
      ).findElement(By.css('input[name="max_participants"]'));

      await pwInput.clear();
      await pwInput.sendKeys("10");
    }
    {
      const submitButton = await (
        await shadow(pwProjectCreate)
      ).findElement(By.css('button[type="submit"]'));

      await click(driver, submitButton);
    }

    await driver.wait(until.urlContains("/projects/edit"));
  }

  {
    // edit project
    const pwApp = await driver.findElement(By.css("pw-app"));

    const accountsLink = await (
      await shadow(pwApp)
    ).findElement(By.css('a[href="/projects"]'));

    await click(driver, accountsLink);

    const pwUsers = await (
      await shadow(pwApp)
    ).findElement(By.css("pw-projects"));

    const user2 = await (
      await shadow(pwUsers)
    ).findElement(By.css('a[href="/projects/edit/7"]'));

    await click(driver, user2);

    const pwUserCreate = await (
      await shadow(pwApp)
    ).findElement(By.css("pw-project-create"));

    const pwUserGroup = await (
      await shadow(pwUserCreate)
    ).findElement(By.css('input[name="title"]'));

    await pwUserGroup.clear();
    await pwUserGroup.sendKeys(randomValue);

    const submitButton = await (
      await shadow(pwUserCreate)
    ).findElement(By.css('button[type="submit"]'));

    await click(driver, submitButton);

    await driver.wait(until.urlContains("/projects/edit"));
  }

  {
    // view project

    const pwApp = await driver.findElement(By.css("pw-app"));

    const accountsLink = await (
      await shadow(pwApp)
    ).findElement(By.css('a[href="/projects"]'));

    await click(driver, accountsLink);

    const pwUsers = await (
      await shadow(pwApp)
    ).findElement(By.css("pw-projects"));

    const user = await (
      await shadow(pwUsers)
    ).findElement(By.css('a[href="/projects/view/7"]'));

    await click(driver, user);

    const pwUserCreate = await (
      await shadow(pwApp)
    ).findElement(By.css("pw-project-create"));

    const pwUserGroup = await (
      await shadow(pwUserCreate)
    ).findElement(By.css('input[name="title"]'));

    assert.equal(await pwUserGroup.getAttribute("value"), randomValue);

    await driver.navigate().back();
  }
}


  {
    // filtering users

    const pwApp = await driver.findElement(By.css("pw-app"));

    const accountsLink = await (
      await shadow(pwApp)
    ).findElement(By.css('a[href="/users"]'));

    await click(driver, accountsLink);

    const pwUsers = await (await shadow(pwApp)).findElement(By.css("pw-users"));

    const filterUsername = await (
      await shadow(pwUsers)
    ).findElement(By.css('input[name="filters,username"]'));

    // @ts-expect-error wrong typings
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await driver.setNetworkConditions({
      offline: false,
      latency: 100, // Additional latency (ms).
      download_throughput: 50 * 1024, // Maximal aggregated download throughput.
      upload_throughput: 50 * 1024, // Maximal aggregated upload throughput.
    });

    await filterUsername.sendKeys("admin");

    const loadingSpinner = await (
      await shadow(pwUsers)
    ).findElement(By.css(".spinner-grow"));

    assert.ok(loadingSpinner.isDisplayed());

    console.log(new Date());

    await driver.wait(until.stalenessOf(loadingSpinner));

    console.log(new Date());

    // @ts-expect-error wrong typings
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await driver.setNetworkConditions({
      offline: false,
      latency: 0, // Additional latency (ms).
      download_throughput: 0, // Maximal aggregated download throughput.
      upload_throughput: 0, // Maximal aggregated upload throughput.
    });

    // TODO FIXME verify results
  }

  {
    // filtering projects

    const pwApp = await driver.findElement(By.css("pw-app"));

    const accountsLink = await (
      await shadow(pwApp)
    ).findElement(By.css('a[href="/projects"]'));

    await click(driver, accountsLink);

    const pwUsers = await (
      await shadow(pwApp)
    ).findElement(By.css("pw-projects"));

    const filterUsername = await (
      await shadow(pwUsers)
    ).findElement(By.css('input[name="filters,title"]'));

    // @ts-expect-error wrong typings
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await driver.setNetworkConditions({
      offline: false,
      latency: 100, // Additional latency (ms).
      download_throughput: 50 * 1024, // Maximal aggregated download throughput.
      upload_throughput: 50 * 1024, // Maximal aggregated upload throughput.
    });

    await filterUsername.sendKeys("randomproject");

    const loadingSpinner = await (
      await shadow(pwUsers)
    ).findElement(By.css(".spinner-grow"));

    assert.ok(loadingSpinner.isDisplayed());

    console.log(new Date());

    await driver.wait(until.stalenessOf(loadingSpinner));

    console.log(new Date());

    // @ts-expect-error wrong typings
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await driver.setNetworkConditions({
      offline: false,
      latency: 0, // Additional latency (ms).
      download_throughput: 0, // Maximal aggregated download throughput.
      upload_throughput: 0, // Maximal aggregated upload throughput.
    });
  }

  // TODO filtering with error (this alerts currently afaik (if the error is detected client-side))

  // TODO filtering with empty result

  await openNavbar(driver);

  {
    // logout
    const pwApp = await driver.findElement(By.css("pw-app"));

    const logoutButton = await (
      await shadow(pwApp)
    ).findElement(By.partialLinkText("Logout"));

    assert.equal(await logoutButton.getText(), "Logout admin");

    await logoutButton.click();
  }

  await openNavbar(driver);

  {
    // check logged out
    const pwApp = await driver.findElement(By.css("pw-app"));

    const loginLink = await (
      await shadow(pwApp)
    ).findElement(By.css('a[href="/login"]'));

    assert.equal(await loginLink.getText(), "Login");
  }

  {
    // check logged out by checking no permissions

    await driver.get(`${process.env.BASE_URL}/projects`);

    const pwApp = await driver.findElement(By.css("pw-app"));

    const pwProjects = await (
      await shadow(pwApp)
    ).findElement(By.css("pw-projects"));

    const alert = await (
      await shadow(pwProjects)
    ).findElement(By.css('div[class="alert alert-danger"]'));

    assert.match(
      await alert.getText(),
      /Nicht angemeldet! Klicke rechts oben auf Anmelden./
    );
  }
}

// TODO FIXME reset database

// TODO FIXME allow tests in parallel (if not reset database)
// TODO FIXME allow only running some tests

void runTest(baseTest);
*/
