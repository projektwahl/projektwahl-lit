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
import argon2 from "@dev.mohe/argon2";

// we could also additionally do the PBKDF2 client side so no log leaks etc would be possible.

// https://datatracker.ietf.org/doc/html/rfc9106#section-4
// If much less memory is available, a uniformly safe option is
// Argon2id with t=3 iterations, p=4 lanes, m=2^(16) (64 MiB of
// RAM), 128-bit salt, and 256-bit tag size.  This is the SECOND
// RECOMMENDED option.
const argon2Options = {
  type: argon2.argon2id,
  timeCost: 3,
  memoryCost: 2 ** 16, // 2 ** 16 KB (64 MB)
  saltLength: 128 / 8, // 16
  hashLength: 256 / 8, // 32
  parallelism: 4,
};

/*
import nodeCrypto from "node:crypto";
// @ts-expect-error wrong typings
const { webcrypto: crypto }: { webcrypto: Crypto } = nodeCrypto;

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

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, argon2Options);
}

export async function checkPassword(
  hash: string,
  password: string
): Promise<[boolean, boolean, string]> {
  const needsRehash = argon2.needsRehash(hash, argon2Options);
  return [
    await argon2.verify(hash, password, argon2Options),
    needsRehash,
    needsRehash ? await argon2.hash(password, argon2Options) : hash,
  ];
}
