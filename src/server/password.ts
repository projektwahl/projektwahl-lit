// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import argon2 from 'argon2';

// TODO FIXME probably switch back to argon2 it seems like we may be able to build it from source using the instructions in README
// for now probably not too important as almost everybody should be using OpenID
// we could also additionally do the PBKDF2 client side so no log leaks etc would be possible.

const argon2Options = {
	type: argon2.argon2id,
	timeCost: 3,
	memoryCost: 64 * 1024, // 64 MiB
	saltLength: 128 / 8, // 16
	hashLength: 256 / 8, // 32
	parallelism: 4
};

/*
import crypto from "node:crypto";

const webcrypto = crypto.webcrypto as unknown as Crypto;

async function getKeyMaterial(password: string): Promise<CryptoKey> {
  let enc = new TextEncoder();
  return webcrypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
}

async function hashPasswordWithSalt(
  password: string,
  salt: Buffer
): Promise<Buffer> {
  let keyMaterial = await getKeyMaterial(password);
  return Buffer.from(
    await webcrypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 1200000,
        hash: "SHA-512",
      },
      keyMaterial,
      512
    )
  );
}

export async function hashPassword(
  password: string
): Promise<[Buffer, Buffer]> {
  const salt = webcrypto.getRandomValues(new Uint8Array(64));
  return [
    await hashPasswordWithSalt(password, Buffer.from(salt)),
    Buffer.from(salt),
  ];
}

export async function checkPassword(
  hash: Buffer,
  salt: Buffer,
  password: string
): Promise<boolean> {
  return crypto.timingSafeEqual(
    await hashPasswordWithSalt(password, salt),
    hash
  );
}
*/

export async function hashPassword(
  password: string
): Promise<string> {
  return await argon2.hash(password, argon2Options);
}

export async function checkPassword(
  hash: string,
  password: string
): Promise<[boolean, boolean, string]> {
  const needsRehash = await argon2.needsRehash(hash, argon2Options);
  return [await argon2.verify(hash, password, argon2Options), needsRehash, needsRehash ? await argon2.hash(password, argon2Options) : hash]
}