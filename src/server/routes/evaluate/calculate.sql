-- SPDX-License-Identifier: AGPL-3.0-or-later
-- SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
SELECT t.user_id, t.project_id, t.rank FROM present_voters, LATERAL
    (WITH c AS (SELECT * FROM choices WHERE choices.user_id = present_voters.id LIMIT 6), c_count AS (SELECT COUNT(*) AS count FROM c)
        SELECT user_id, project_id, rank FROM c WHERE (SELECT count FROM c_count) = 5
        UNION ALL
        SELECT present_voters.id as user_id, projects.id AS project_id, 0 as rank FROM projects WHERE (SELECT count FROM c_count) != 5 AND present_voters.age >= projects.min_age AND present_voters.age <= projects.max_age AND present_voters.project_leader_id IS DISTINCT FROM projects.id
    )
    t ORDER BY t.user_id;
-- 33 ms