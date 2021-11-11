// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
/*import argon2 from 'argon2';

const argon2Options = {
	type: argon2.argon2id,
	timeCost: 3,
	memoryCost: 64 * 1024, // 64 MiB
	saltLength: 128 / 8, // 16
	hashLength: 256 / 8, // 32
	parallelism: 4
};*/
import crypto, { webcrypto } from "node:crypto";

/**
 *
 * @param {string} password
 * @returns {Promise<CryptoKey>}
 */
async function getKeyMaterial(password) {
  let enc = new TextEncoder();
  return webcrypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
}

/**
 *
 * @param {string} password
 * @param {Buffer} salt
 * @returns {Promise<Buffer>}
 */
async function hashPasswordWithSalt(password, salt) {
  let keyMaterial = await getKeyMaterial(password);
  return Buffer.from(await webcrypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  ));
}

/**
 *
 * @param {string} password
 * @returns Promise<[Buffer, Buffer]>
 */
export async function hashPassword(password) {
  const salt = webcrypto.getRandomValues(new Uint8Array(64));
  return [await hashPasswordWithSalt(password, salt), Buffer.from(salt)];
}

/**
 *
 * @param {Buffer} hash
 * @param {Buffer} salt
 * @param {string} password
 * @returns {Promise<boolean>}
 */
export async function checkPassword(hash, salt, password) {
  return crypto.timingSafeEqual(
    await hashPasswordWithSalt(password, salt),
    hash
  );
}
