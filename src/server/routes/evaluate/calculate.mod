# SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
# SPDX-License-Identifier: AGPL-3.0-or-later
# http://gusek.sourceforge.net/gmpl.pdf
# https://ampl.com/resources/the-ampl-book/chapter-downloads/

# TODO FIXME maybe it doesnt work if a project doesnt exist at all as we forgot that edge case?

#If you encounter problems with your MathProg model, you can investigate further by specifying the GLPSOL options --nopresol to disable the LP presolver and --output filename.out to write the final solution to a text file. 
# glpsol --math src/lib/calculate.mod --data /tmp/nix-shell.BEclKU/projektwahl-Ms1tfU/data.dat --wmps problem/wmps --wfreemps problem/wfreemps --wlp problem/wlp --wglp problem/wglp
# wlp is definitely the best format
# WARNING: if a linear conditional evaluates to nothing it will add a fake 0 * somerandomvariable it seems as the lp format probably doesnt support an empty format

set U; # users

set P; # projects

set PA := {'min_participants', 'max_participants'};

# choices (if the user voted something the others get -1 then?)
param choices{u in U, p in P} integer default -1;

param projects{p in P, pa in PA} integer;

param project_leaders{u in U} symbolic; # -1 for not a project leader

var user_in_project{u in U, p in P} binary;

var project_not_exists{p in P} binary;

var user_is_project_leader{u in U} binary;

# TODO FIXME user not in project they are project leader in

maximize total_benefits: sum {u in U, p in P} if choices[u,p] != -1 then choices[u,p] * user_in_project[u,p];

subject to notinprojectyoudidntvote{u in U, p in P}:
    if choices[u,p] == -1 then user_in_project[u,p] = 0;

subject to no_project_leader{u in U}: if project_leaders[u] == 'null' then user_is_project_leader[u] else 0 = 0;

subject to either_project_leader_or_project_not_exists{u in U}:
    if project_leaders[u] != 'null' then user_is_project_leader[u] + project_not_exists[project_leaders[u]] else 1 = 1;

subject to onlyinoneproject{u in U}: (sum {p in P} user_in_project[u,p]) + user_is_project_leader[u] = 1;

subject to project_min_size{p in P}: (sum {u in U} user_in_project[u,p]) + projects[p,'min_participants'] * project_not_exists[p] >= projects[p,'min_participants'];
subject to project_max_size{p in P}: (sum {u in U} user_in_project[u,p]) + projects[p,'max_participants'] * project_not_exists[p] <= projects[p,'max_participants'];

solve;

printf '{\n "projects": {\n';

printf{p in P} '  "' & p & '": {\n   "exists": ' & (1 - project_not_exists[p]) & ',\n   "participants": ' & (sum {u in U} user_in_project[u,p]) & '\n  },\n';

printf ' },\n "users": {\n';

for{u in U, p in P} {
    printf (if user_in_project[u,p] then '  "' & u & '": {\n   "computed_in_project": "' & p & '"\n  },\n' else '');
    printf (if user_is_project_leader[u] then '  "' & u & '": {\n   "project_leader": true\n  },\n' else '');
}

printf ' }\n}\n';

end;
