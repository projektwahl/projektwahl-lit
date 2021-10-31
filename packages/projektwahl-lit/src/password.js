// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import argon2 from 'argon2';

const argon2Options = {
	type: argon2.argon2id,
	timeCost: 3,
	memoryCost: 64 * 1024, // 64 MiB
	saltLength: 128 / 8, // 16
	hashLength: 256 / 8, // 32
	parallelism: 4
};

/**
 * 
 * @param {string} password 
 * @returns Promise<string>
 */
export async function hashPassword(password) {
	// https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-argon2-13
	return await argon2.hash(password, argon2Options);
}

/**
 * 
 * @param {string} hash 
 * @param {string} password 
 * @returns {Promise<boolean>}
 */
export async function checkPassword(hash, password) {
	return await argon2.verify(hash, password, argon2Options);
}