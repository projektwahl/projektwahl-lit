-- SPDX-License-Identifier: AGPL-3.0-or-later
-- SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

SELECT t.user_id, t.project_id, t.rank FROM present_voters, LATERAL
    (WITH c AS (SELECT * FROM choices WHERE choices.user_id = present_voters.id), c_valid AS (SELECT COUNT(*) AS count, bit_or(1 << rank) AS ranks FROM c)
        SELECT user_id, project_id, rank FROM c WHERE (SELECT c_valid.count = 5 AND c_valid.ranks = 62 FROM c_valid)
        UNION ALL
        SELECT present_voters.id as user_id, projects.id AS project_id, 0 as rank FROM projects WHERE (SELECT NOT (c_valid.count = 5 AND c_valid.ranks = 62) FROM c_valid) AND projects.random_assignments AND present_voters.age >= projects.min_age AND present_voters.age <= projects.max_age AND present_voters.project_leader_id IS DISTINCT FROM projects.id
    )
    t WHERE present_voters.force_in_project_id IS NULL ORDER BY t.user_id;
