// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { Result } from "./lib/result";
import { Routes } from "./routes";

export const myFetch = async <P extends keyof Routes>(
  url: P,
	options: RequestInit | undefined
): Promise<Result<Routes[P], { network?: string; } & { [key in keyof (Routes[P])]?: string; }>> => {
	try {
		const response = await fetch(url, options);
		if (!response.ok) {
			try {
				const additionalInfo = await response.text();
				return {
					result: 'failure',
					failure: {
						network: `Failed to request ${url}: ${response.status} ${response.statusText}\nAdditional information: ${additionalInfo}`
					}
				};
			} catch (error: unknown) {
				return {
					result: 'failure',
					failure: {
						network: `Failed to request ${url}: ${response.status} ${response.statusText}`
					}
				};
			}
		}
		const result = (await response.json());
		return result;
	} catch (error) {
		console.error(error);
		if (error instanceof TypeError) {
			return {
				result: 'failure',
				failure: {
					network: `Failed to request ${url}: ${error.message}\nAdditional information: ${
						error.stack ?? 'none'
					}`
				}
			};
		} else {
			return {
				result: 'failure',
				failure: {
					network: `Failed to request ${url}: Unknown error see console.`
				}
			};
		}
	}
};