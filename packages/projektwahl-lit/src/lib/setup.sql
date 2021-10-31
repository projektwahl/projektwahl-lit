-- SPDX-License-Identifier: AGPL-3.0-or-later
-- SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

-- if you remove this you get a CVE for free - so don't. (because the triggers can have race conditions then)
ALTER DATABASE projektwahl SET default_transaction_isolation = 'serializable';
ALTER DATABASE projektwahl SET default_transaction_read_only = true;

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY NOT NULL,
  title VARCHAR(255) NOT NULL,
  info VARCHAR(4096) NOT NULL,
  place VARCHAR(256) NOT NULL,
  costs DECIMAL(4,2) NOT NULL,
  min_age INTEGER NOT NULL,
  max_age INTEGER NOT NULL,
  min_participants INTEGER NOT NULL,
  max_participants INTEGER NOT NULL,
  presentation_type VARCHAR(512) NOT NULL,
  requirements VARCHAR(1024) NOT NULL,
  random_assignments BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TYPE user_type AS ENUM ('admin', 'helper', 'voter');

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(512),
  type user_type NOT NULL,
  project_leader_id INTEGER, -- TODO FIXME maybe m:n as somebody could theoretically be in multiple projects?
  "group" VARCHAR(16),
  age INTEGER,
  away BOOLEAN NOT NULL DEFAULT FALSE,
  password_changed BOOLEAN NOT NULL DEFAULT FALSE,
  force_in_project_id INTEGER, -- this should still be stored here even with openid as we can't join on it otherwise
  computed_in_project_id INTEGER, -- this should still be stored here even with openid as we can't join on it otherwise
  -- TODO maybe add computed_in_project_id so you can manually force people in a project and this doesn't break when calculating
  FOREIGN KEY (project_leader_id)
    REFERENCES projects(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT,
  FOREIGN KEY (force_in_project_id)
    REFERENCES projects(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT,
  FOREIGN KEY (computed_in_project_id)
    REFERENCES projects(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT
);

-- EXPLAIN ANALYZE VERBOSE SELECT id,name,type FROM users ORDER BY type ASC,name DESC;
-- maybe add an index on name and maybe on type (or replace by enum?)

CREATE TABLE IF NOT EXISTS choices (
  rank INTEGER NOT NULL, -- TODO FIXME add checks here and on other places e.g. that this is from 1 - 5
  project_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  PRIMARY KEY(user_id,project_id),
  FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT,
  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY NOT NULL,
  election_running BOOLEAN NOT NULL
);


CREATE VIEW present_voters AS SELECT * FROM users WHERE type = 'voter' AND NOT away;


-- https://www.cybertec-postgresql.com/en/triggers-to-enforce-constraints/
-- https://www.bizety.com/2018/09/24/acidrain-concurrency-attacks-on-database-backed-applications/
-- https://dl.acm.org/doi/10.1145/3035918.3064037

-- START TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- alternatively: pessimistic locking: FOR KEY SHARE OF on_duty

-- TODO LOOK AT https://www.postgresql.org/docs/current/plpgsql-trigger.html

CREATE OR REPLACE FUNCTION check_choices_age() RETURNS TRIGGER AS $test1$
BEGIN
  IF (SELECT min_age FROM projects WHERE id = NEW.project_id) > (SELECT age FROM users WHERE id = NEW.user_id) OR
     (SELECT max_age FROM projects WHERE id = NEW.project_id) < (SELECT age FROM users WHERE id = NEW.user_id) THEN
      RAISE EXCEPTION 'Der Nutzer passt nicht in die Altersbegrenzung des Projekts!';
  END IF;
  RETURN NEW;
END;
$test1$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_choices_age ON choices;

CREATE TRIGGER trigger_check_choices_age
BEFORE INSERT ON choices -- probably also update?
FOR EACH ROW
EXECUTE FUNCTION check_choices_age();




CREATE OR REPLACE FUNCTION update_project_check_choices_age() RETURNS TRIGGER AS $test2$
BEGIN
  IF (SELECT COUNT(*) FROM choices, users WHERE choices.project_id = NEW.id AND users.id = choices.user_id AND (users.age < NEW.min_age OR users.age > NEW.max_age)) > 0 THEN
      RAISE EXCEPTION 'Geänderte Altersbegrenzung wuerde Wahlen ungültig machen!';
  END IF;
  RETURN NEW;
END;
$test2$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_project_check_choices_age ON projects;

CREATE TRIGGER trigger_update_project_check_choices_age
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_project_check_choices_age();


CREATE OR REPLACE FUNCTION check_project_leader_voted_own_project() RETURNS TRIGGER AS $test3$
BEGIN
  IF (SELECT COUNT(*) FROM choices WHERE choices.project_id = NEW.project_leader_id AND choices.user_id = NEW.id) > 0 THEN
      RAISE EXCEPTION 'Nutzer kann nicht Projektleiter in einem Projekt sein, das er gewählt hat!';
  END IF;
  RETURN NEW;
END;
$test3$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_project_leader_voted_own_project ON users;

CREATE TRIGGER trigger_check_project_leader_voted_own_project BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION check_project_leader_voted_own_project();



CREATE OR REPLACE FUNCTION check_project_leader_choices() RETURNS TRIGGER AS $test4$
BEGIN
  IF (SELECT COUNT(*) FROM users WHERE users.project_leader_id = NEW.project_id AND users.id = NEW.user_id) > 0 THEN
      RAISE EXCEPTION 'Nutzer kann Projekt nicht wählen, in dem er Projektleiter ist!';
  END IF;
  RETURN NEW;
END;
$test4$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_project_leader_choices ON choices;

CREATE TRIGGER trigger_check_project_leader_choices BEFORE INSERT ON choices
FOR EACH ROW
EXECUTE FUNCTION check_project_leader_choices();



INSERT INTO settings (id, election_running) VALUES (1, false) ON CONFLICT DO NOTHING;
