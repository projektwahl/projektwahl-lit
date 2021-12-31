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
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
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
