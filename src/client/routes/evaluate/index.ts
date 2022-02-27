// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';
import type { MyLocals } from 'src/hooks';
import { mkdtemp, open, readFile } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import JSON5 from 'json5';
import type { JSONValue } from '@sveltejs/kit/types/helper';
import type { Existing, RawChoiceType, RawProjectType, RawUserVoterType } from '$lib/types';

// TODO FIXME if you're wondering why this doesn't give a solution it's because the min_participants is too high
// or not

// TODO FIXME check for people who didn't vote or are project leaders and didn't get in their project

// https://neos-server.org/neos/cgi-bin/nph-neos-solver.cgi
// https://neos-server.org/neos/admin.html

export const get: RequestHandler<MyLocals, JSONValue> = async function (request) {
	// maybe store rank as binary bitfield so every bit represents a rank. then we can sum and compare the count of the summed values and the sum = 0b11111
	// bit-wise encoding of ranks and then compare with 0b11111

	const dir = await mkdtemp(path.join(os.tmpdir(), 'projektwahl-'));
	const filePath = path.join(dir, 'data.dat');
	const outputFilePath1 = path.join(dir, 'output1.txt'); // TODO FIXME as it's probably not opend with O_EXCL this is dangerous
	const outputFilePath2 = path.join(dir, 'output2.txt'); // TODO FIXME as it's probably not opend with O_EXCL this is dangerous
	const outputFilePath3 = path.join(dir, 'output3.txt'); // TODO FIXME as it's probably not opend with O_EXCL this is dangerous
	const fileHandle = await open(
		filePath,
		constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL,
		0o600
	);

	await sql.begin(async (sql) => {
		// transaction guarantees consistent view of data

		const projects: Existing<RawProjectType>[] =
			await sql`SELECT id, min_participants, max_participants FROM projects;`;

		await fileHandle.write(`data;${os.EOL}`);
		await fileHandle.write(`set P :=`);
		for (const p of projects) {
			await fileHandle.write(` project${p.id}`);
		}
		await fileHandle.write(`;${os.EOL}`);

		const users: Existing<RawUserVoterType>[] =
			await sql`SELECT id, project_leader_id FROM present_voters;`;

		await fileHandle.write(`set U :=`);
		for (const u of users) {
			await fileHandle.write(` user${u.id}`);
		}
		await fileHandle.write(`;${os.EOL}`);

		await fileHandle.write(`param project_leaders`);
		for (const u of users) {
			await fileHandle.write(
				` [user${u.id}] ${u.project_leader_id ? `project${u.project_leader_id}` : `null`}`
			);
		}
		await fileHandle.write(`;${os.EOL}`);

		await fileHandle.write(`param projects : min_participants max_participants :=${os.EOL}`);
		for (const p of projects) {
			await fileHandle.write(`project${p.id} ${p.min_participants} ${p.max_participants}${os.EOL}`);
		}
		await fileHandle.write(`;${os.EOL}`);

		// TODO FIXME check random assignments allowed

		// TODO FIXME filter aways and filter type=voter
		const choices: RawChoiceType[] = await sql.file('src/lib/calculate.sql', [], {
			cache: false // TODO FIXME doesnt seem to work properly
		});

		await fileHandle.write(`param choices`);
		for (const c of choices) {
			await fileHandle.write(
				` [user${c.user_id}, project${c.project_id}] ${5 - c.rank /* FIXME improve this */}`
			);
		}
		await fileHandle.write(`;${os.EOL}`);

		await fileHandle.write(`end;${os.EOL}`);
	});

	//await unlink(filePath);

	await fileHandle.close();

	console.log(filePath);

	try {
		const childProcess = execFile(
			'glpsol',
			[
				'--math',
				'src/lib/calculate.mod',
				'--data',
				filePath,
				'--output',
				outputFilePath1,
				'--write',
				outputFilePath2,
				'--display',
				outputFilePath3
			],
			{}
		);

		if (childProcess.stdout) {
			for await (const chunk of childProcess.stdout) {
				console.log(chunk);
			}
		}

		if (childProcess.stderr) {
			for await (const chunk of childProcess.stderr) {
				console.error(chunk);
			}
		}

		const exitCode = await new Promise((resolve, _reject) => {
			childProcess.on('close', resolve);
		});

		console.log(exitCode);

		return {
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(JSON5.parse(await readFile(outputFilePath3, 'utf8'))) // DONT ASK: trailing commas are cool
		};
	} catch (error) {
		console.log(error);
		return {
			body: {
				error: `TODO FIXME print the error here`
			}
		};
	}
};

/*
https://hub.docker.com/r/coinor/coin-or-optimization-suite
docker start coin-or
docker cp src/lib/calculate.mod coin-or:/tmp
docker cp /tmp/nix-shell.c1rX4x/projektwahl-5ClFw2/data.dat coin-or:/tmp
docker exec coin-or /usr/bin/cbc /tmp/calculate.mod
docker exec -it coin-or /bin/bash
*/

// https://ampl.com/products/solvers/open-source/
// GLPK should also have ampl support

// TODO https://github.com/coin-or/Cbc
// probably need to package with AMPL support

// docker pull coinor/coinor-optimization-suite
// https://github.com/NixOS/nixpkgs/blob/8284fc30c84ea47e63209d1a892aca1dfcd6bdf3/pkgs/development/libraries/science/math/osi/default.nix

// https://en.wikipedia.org/wiki/List_of_optimization_software
// MPS, CPLEX LP: GLPK http://www.gnu.org/software/glpk/
// MPS, LP (!= CPLEX LP): LP_Solve http://lpsolve.sourceforge.net/5.5/ http://sourceforge.net/projects/lpsolve/
// https://github.com/coin-or/Cbc
// many including MPS: https://www.scipopt.org/doc/html/group__FILEREADERS.php https://www.scipopt.org/
// TODO OSSolverService https://www.coin-or.org/OS/documentation/node61.html

// https://neos-server.org/neos/solvers/index.html
// https://en.wikipedia.org/wiki/AMPL

// https://www.coin-or.org/downloading/
// https://hub.docker.com/r/coinor/coin-or-optimization-suite
