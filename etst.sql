SELECT id, title, t.project_leaders
FROM projects p, LATERAL (
   SELECT ARRAY (
      SELECT username FROM users WHERE project_leader_id = p.id
      ) AS project_leaders
   ) t;


SELECT id, p.title, t.project_leaders
FROM   projects      p
LEFT JOIN  (
   SELECT u.project_leader_id, array_agg(u.username) AS project_leaders
   FROM   users u
   GROUP  BY u.project_leader_id
   ) t ON p.id = t.project_leader_id;