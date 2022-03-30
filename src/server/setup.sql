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

BEGIN READ WRITE;

-- if you remove this you get a CVE for free - so don't. (because the triggers can have race conditions then)
-- https://www.postgresql.org/docs/current/transaction-iso.html
-- currently done in the setup instructions and not automatically here
-- ALTER DATABASE projektwahl SET default_transaction_isolation = 'serializable';
-- ALTER DATABASE projektwahl SET default_transaction_read_only = true;

-- TODO FIXME at some point create the tables based on the zod definitions? so min/max etc. are checked correctly?
CREATE TABLE IF NOT EXISTS projects_with_deleted (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
  title VARCHAR(255) NOT NULL,
  info VARCHAR(4096) NOT NULL,
  place VARCHAR(256) NOT NULL,
  costs FLOAT NOT NULL,
  min_age INTEGER NOT NULL,
  max_age INTEGER NOT NULL,
  min_participants INTEGER NOT NULL,
  max_participants INTEGER NOT NULL,
  random_assignments BOOLEAN NOT NULL DEFAULT FALSE,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  last_updated_by INTEGER
);

CREATE TABLE IF NOT EXISTS projects_history (
  history_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
  operation TEXT NOT NULL,

  id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  info VARCHAR(4096) NOT NULL,
  place VARCHAR(256) NOT NULL,
  costs FLOAT NOT NULL,
  min_age INTEGER NOT NULL,
  max_age INTEGER NOT NULL,
  min_participants INTEGER NOT NULL,
  max_participants INTEGER NOT NULL,
  random_assignments BOOLEAN NOT NULL DEFAULT FALSE,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  last_updated_by INTEGER
);

CREATE OR REPLACE FUNCTION log_history_projects() RETURNS TRIGGER AS $body$
DECLARE
  d RECORD;
BEGIN
  --if (TG_OP = 'DELETE') then
  --  d := OLD;
  --else
    d := NEW;
  --end if;
  INSERT INTO projects_history (operation, id, title, info, place, costs, min_age, max_age, min_participants, max_participants, random_assignments, deleted, last_updated_by) VALUES (TG_OP, d.id, d.title, d.info, d.place, d.costs, d.min_age, d.max_age, d.min_participants, d.max_participants, d.random_assignments, d.deleted, d.last_updated_by);
  RETURN NULL;
END;
$body$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

REVOKE ALL ON FUNCTION log_history_projects() FROM PUBLIC;

DROP TRIGGER IF EXISTS projects_audit_insert_delete ON projects_with_deleted;

CREATE TRIGGER projects_audit_insert_delete
AFTER INSERT OR DELETE ON projects_with_deleted FOR EACH ROW
EXECUTE PROCEDURE log_history_projects();


DROP TRIGGER IF EXISTS projects_audit_update_selective ON projects_with_deleted;

CREATE TRIGGER projects_audit_update_selective
AFTER UPDATE ON projects_with_deleted FOR EACH ROW
EXECUTE PROCEDURE log_history_projects();

DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('admin', 'helper', 'voter');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- TODO ADd check that group and age is NULL if type is not voter
CREATE TABLE IF NOT EXISTS users_with_deleted (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
  username VARCHAR(64) UNIQUE NOT NULL,
  openid_id VARCHAR(256) UNIQUE,
  password_hash VARCHAR(256),
  type user_type NOT NULL,
  project_leader_id INTEGER, -- TODO FIXME maybe m:n as somebody could theoretically be leader in multiple projects?
  "group" VARCHAR(64),
  age INTEGER,
  away BOOLEAN NOT NULL DEFAULT FALSE,
  password_changed BOOLEAN NOT NULL DEFAULT FALSE,
  force_in_project_id INTEGER,
  computed_in_project_id INTEGER,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  last_updated_by INTEGER
);

CREATE TABLE IF NOT EXISTS users_history (
  history_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
  operation TEXT NOT NULL,

  id INTEGER NOT NULL,
  username VARCHAR(64) NOT NULL,
  openid_id VARCHAR(256),
  type user_type NOT NULL,
  project_leader_id INTEGER, -- TODO FIXME maybe m:n as somebody could theoretically be leader in multiple projects?
  "group" VARCHAR(16),
  age INTEGER,
  away BOOLEAN NOT NULL DEFAULT FALSE,
  password_changed BOOLEAN NOT NULL DEFAULT FALSE,
  force_in_project_id INTEGER,
  computed_in_project_id INTEGER,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  last_updated_by INTEGER
);

ALTER TABLE projects_with_deleted ADD FOREIGN KEY (last_updated_by)
    REFERENCES users_with_deleted(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE projects_history ADD FOREIGN KEY (last_updated_by)
    REFERENCES users_with_deleted(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE projects_history ADD FOREIGN KEY (id)
    REFERENCES projects_with_deleted(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE users_with_deleted ADD FOREIGN KEY (last_updated_by)
    REFERENCES users_with_deleted(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE users_with_deleted ADD FOREIGN KEY (project_leader_id)
    REFERENCES projects_with_deleted(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE users_with_deleted ADD FOREIGN KEY (force_in_project_id)
    REFERENCES projects_with_deleted(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE users_with_deleted ADD FOREIGN KEY (computed_in_project_id)
    REFERENCES projects_with_deleted(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE users_history ADD FOREIGN KEY (last_updated_by)
    REFERENCES users_with_deleted(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE users_history ADD FOREIGN KEY (project_leader_id)
    REFERENCES projects_with_deleted(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE users_history ADD FOREIGN KEY (force_in_project_id)
    REFERENCES projects_with_deleted(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE users_history ADD FOREIGN KEY (computed_in_project_id)
    REFERENCES projects_with_deleted(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

ALTER TABLE users_history ADD FOREIGN KEY (id)
    REFERENCES users_with_deleted(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;

CREATE OR REPLACE FUNCTION log_history_users() RETURNS TRIGGER AS $body$
DECLARE
  d RECORD;
BEGIN
  --if (TG_OP = 'DELETE') then
  --  d := OLD;
  --else
    d := NEW;
  --end if;
  INSERT INTO users_history (operation, id, username, openid_id, type, project_leader_id, "group", age, away, password_changed, force_in_project_id, computed_in_project_id, deleted, last_updated_by) VALUES (TG_OP, d.id, d.username, d.openid_id, d.type, d.project_leader_id, d."group", d.age, d.away, d.password_changed, d.force_in_project_id, d.computed_in_project_id, d.deleted, d.last_updated_by);
  RETURN NULL;
END;
$body$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

REVOKE ALL ON FUNCTION log_history_users() FROM PUBLIC;

DROP TRIGGER IF EXISTS users_audit_insert_delete ON users_with_deleted;

CREATE TRIGGER users_audit_insert_delete
AFTER INSERT OR DELETE ON users_with_deleted FOR EACH ROW
EXECUTE PROCEDURE log_history_users();


DROP TRIGGER IF EXISTS users_audit_update_selective ON users_with_deleted;

CREATE TRIGGER users_audit_update_selective
AFTER UPDATE ON users_with_deleted FOR EACH ROW
EXECUTE PROCEDURE log_history_users();

CREATE TABLE IF NOT EXISTS choices (
  rank INTEGER NOT NULL, -- TODO FIXME add checks here and on other places e.g. that this is from 1 - 5
  project_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  PRIMARY KEY(user_id,project_id),
  FOREIGN KEY (project_id)
    REFERENCES projects_with_deleted(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT,
  FOREIGN KEY (user_id)
    REFERENCES users_with_deleted(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS choices_history (
  history_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
  operation TEXT NOT NULL,

  rank INTEGER NOT NULL, -- TODO FIXME add checks here and on other places e.g. that this is from 1 - 5
  project_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (project_id)
    REFERENCES projects_with_deleted(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT,
  FOREIGN KEY (user_id)
    REFERENCES users_with_deleted(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT
);

CREATE OR REPLACE FUNCTION log_history_choices() RETURNS TRIGGER AS $body$
DECLARE
  d RECORD;
BEGIN
  if (TG_OP = 'DELETE') then
    d := OLD;
  else
    d := NEW;
  end if;
  INSERT INTO choices_history (operation, rank, project_id, user_id) VALUES (TG_OP, d.rank, d.project_id, d.user_id);
  RETURN NULL;
END;
$body$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

REVOKE ALL ON FUNCTION log_history_choices() FROM PUBLIC;

DROP TRIGGER IF EXISTS choices_audit_insert_delete ON choices;

CREATE TRIGGER choices_audit_insert_delete
AFTER INSERT OR DELETE ON choices FOR EACH ROW
EXECUTE PROCEDURE log_history_choices();


DROP TRIGGER IF EXISTS choices_audit_update_selective ON choices;

CREATE TRIGGER choices_audit_update_selective
AFTER UPDATE ON choices FOR EACH ROW
EXECUTE PROCEDURE log_history_choices();

CREATE TABLE IF NOT EXISTS sessions (
  session_id BYTEA PRIMARY KEY NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id)
    REFERENCES users_with_deleted(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY NOT NULL,
  election_running BOOLEAN NOT NULL
);

CREATE OR REPLACE VIEW users AS SELECT * FROM users_with_deleted WHERE NOT deleted;

CREATE OR REPLACE VIEW projects AS SELECT * FROM projects_with_deleted WHERE NOT deleted;

CREATE OR REPLACE VIEW present_voters AS SELECT * FROM users WHERE type = 'voter' AND NOT away;

-- https://www.cybertec-postgresql.com/en/triggers-to-enforce-constraints/
-- https://www.bizety.com/2018/09/24/acidrain-concurrency-attacks-on-database-backed-applications/
-- https://dl.acm.org/doi/10.1145/3035918.3064037

-- START TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- alternatively: pessimistic locking: FOR KEY SHARE OF on_duty

-- TODO LOOK AT https://www.postgresql.org/docs/current/plpgsql-trigger.html

CREATE OR REPLACE FUNCTION check_choices_age() RETURNS TRIGGER AS $body$
BEGIN
  IF (SELECT min_age FROM projects_with_deleted WHERE id = NEW.project_id) > (SELECT age FROM users_with_deleted WHERE id = NEW.user_id) OR
     (SELECT max_age FROM projects_with_deleted WHERE id = NEW.project_id) < (SELECT age FROM users_with_deleted WHERE id = NEW.user_id) THEN
      RAISE EXCEPTION 'Der Nutzer passt nicht in die Altersbegrenzung des Projekts!';
  END IF;
  RETURN NEW;
END;
$body$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_choices_age ON choices;

CREATE TRIGGER trigger_check_choices_age
BEFORE INSERT OR UPDATE ON choices
FOR EACH ROW
EXECUTE FUNCTION check_choices_age();




CREATE OR REPLACE FUNCTION update_project_check_choices_age() RETURNS TRIGGER AS $test2$
BEGIN
  IF (SELECT COUNT(*) FROM choices, users_with_deleted WHERE choices.project_id = NEW.id AND users_with_deleted.id = choices.user_id AND (users_with_deleted.age < NEW.min_age OR users_with_deleted.age > NEW.max_age)) > 0 THEN
      RAISE EXCEPTION 'Geänderte Altersbegrenzung wuerde Wahlen ungültig machen!';
  END IF;
  RETURN NEW;
END;
$test2$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_project_check_choices_age ON projects_with_deleted;

CREATE TRIGGER trigger_update_project_check_choices_age
BEFORE UPDATE ON projects_with_deleted
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

DROP TRIGGER IF EXISTS trigger_check_project_leader_voted_own_project ON users_with_deleted;

CREATE TRIGGER trigger_check_project_leader_voted_own_project BEFORE UPDATE ON users_with_deleted
FOR EACH ROW
EXECUTE FUNCTION check_project_leader_voted_own_project();



CREATE OR REPLACE FUNCTION check_project_leader_choices() RETURNS TRIGGER AS $test4$
BEGIN
  IF (SELECT COUNT(*) FROM users_with_deleted WHERE users_with_deleted.project_leader_id = NEW.project_id AND users_with_deleted.id = NEW.user_id) > 0 THEN
      RAISE EXCEPTION 'Nutzer kann Projekt nicht wählen, in dem er Projektleiter ist!';
  END IF;
  RETURN NEW;
END;
$test4$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_project_leader_choices ON choices;

CREATE TRIGGER trigger_check_project_leader_choices BEFORE INSERT ON choices
FOR EACH ROW
EXECUTE FUNCTION check_project_leader_choices();



-- https://www.postgresql.org/docs/current/plpgsql.html


-- https://www.postgresql.org/docs/14/plpgsql-trigger.html
-- https://www.postgresql.org/docs/current/sql-createtrigger.html

CREATE OR REPLACE FUNCTION check_users_project_leader_id1() RETURNS TRIGGER AS $body$
BEGIN
  IF (SELECT COUNT(*) FROM users_with_deleted WHERE id = NEW.last_updated_by AND type = 'admin') = 1 THEN
    RETURN NEW;
  END IF;
  IF (SELECT COUNT(*) FROM users_with_deleted WHERE id = NEW.last_updated_by AND type = 'helper') != 1 THEN
    RAISE EXCEPTION 'Nur Lehrer und Admins dürfen dies ändern!';
  END IF;
  IF (NEW.project_leader_id IS NULL) THEN
    IF (SELECT COUNT(*) FROM users_with_deleted AS voter INNER JOIN users_with_deleted AS helper ON voter.id = OLD.id AND voter.type = 'voter' AND voter.project_leader_id IS NOT NULL AND helper.id = NEW.last_updated_by AND helper.type = 'helper' AND helper.project_leader_id = voter.project_leader_id) != 1 THEN
      RAISE EXCEPTION 'Sie dürfen nur aus Ihrem eigenen Projekt Projektleiter entfernen!';
    END IF;
  ELSE
    IF (SELECT COUNT(*) FROM users_with_deleted AS voter INNER JOIN users_with_deleted AS helper ON voter.id = OLD.id AND voter.type = 'voter' AND voter.project_leader_id IS NULL AND helper.id = NEW.last_updated_by AND helper.type = 'helper' AND helper.project_leader_id = NEW.project_leader_id) != 1 THEN
      RAISE EXCEPTION 'Sie dürfen nur in Ihr eigenes Projekt Projektleiter hinzufügen!';
    END IF;
  END IF;
  RETURN NEW;
END;
$body$ LANGUAGE plpgsql;

-- warning: Copy pasta from above
CREATE OR REPLACE FUNCTION check_users_force_in_project() RETURNS TRIGGER AS $body$
BEGIN
  IF (SELECT COUNT(*) FROM users_with_deleted WHERE id = NEW.last_updated_by AND type = 'admin') = 1 THEN
    RETURN NEW;
  END IF;
  IF (SELECT COUNT(*) FROM users_with_deleted WHERE id = NEW.last_updated_by AND type = 'helper') != 1 THEN
    RAISE EXCEPTION 'Nur Lehrer und Admins dürfen dies ändern!';
  END IF;
  IF (NEW.force_in_project_id IS NULL) THEN
    IF (SELECT COUNT(*) FROM users_with_deleted AS voter INNER JOIN users_with_deleted AS helper ON voter.id = OLD.id AND voter.type = 'voter' AND voter.force_in_project_id IS NOT NULL AND helper.id = NEW.last_updated_by AND helper.type = 'helper' AND helper.force_in_project_id = voter.force_in_project_id) != 1 THEN
      RAISE EXCEPTION 'Sie dürfen nur aus Ihrem eigenen Projekt Mitglieder entfernen!';
    END IF;
  ELSE
    IF (SELECT COUNT(*) FROM users_with_deleted AS voter INNER JOIN users_with_deleted AS helper ON voter.id = OLD.id AND voter.type = 'voter' AND voter.force_in_project_id IS NULL AND helper.id = NEW.last_updated_by AND helper.type = 'helper' AND helper.force_in_project_id = NEW.force_in_project_id) != 1 THEN
      RAISE EXCEPTION 'Sie dürfen nur in Ihr eigenes Projekt Mitglieder hinzufügen!';
    END IF;
  END IF;
  RETURN NEW;
END;
$body$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_users_project_leader_id1 ON users_with_deleted;

CREATE TRIGGER trigger_check_users_project_leader_id1
BEFORE UPDATE OF project_leader_id ON users_with_deleted
FOR EACH ROW
EXECUTE FUNCTION check_users_project_leader_id1();




DROP TRIGGER IF EXISTS trigger_check_users_force_in_project ON users_with_deleted;

CREATE TRIGGER trigger_check_users_force_in_project
BEFORE UPDATE OF force_in_project_id ON users_with_deleted
FOR EACH ROW
EXECUTE FUNCTION check_users_force_in_project();





CREATE OR REPLACE FUNCTION check_users_project_leader_id2() RETURNS TRIGGER AS $body$
BEGIN
  IF (SELECT COUNT(*) FROM users_with_deleted WHERE id = NEW.last_updated_by AND type = 'admin') != 1 THEN
    RAISE EXCEPTION 'Lehrer dürfen Schüler nur Projektleiter oder Mitglieder ihrer eigenen Projekte ändern.';
  END IF;
  RETURN NEW;
END;
$body$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_users_project_leader_id2 ON users_with_deleted;

-- SECURITY: Update columns if you add/change some
CREATE TRIGGER trigger_check_users_project_leader_id2
BEFORE UPDATE OF id, username, openid_id, password_hash, type, "group", age, away, password_changed, computed_in_project_id, deleted ON users_with_deleted
FOR EACH ROW
EXECUTE FUNCTION check_users_project_leader_id2();





CREATE OR REPLACE FUNCTION check_users_project_leader_id3() RETURNS TRIGGER AS $body$
BEGIN
  IF NEW.last_updated_by IS NOT NULL AND (SELECT COUNT(*) FROM users_with_deleted WHERE id = NEW.last_updated_by AND type = 'admin') != 1 THEN
    RAISE EXCEPTION 'Lehrer dürfen keine Schüler erstellen!';
  END IF;
  RETURN NEW;
END;
$body$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_users_project_leader_id3 ON users_with_deleted;

CREATE TRIGGER trigger_check_users_project_leader_id3
BEFORE INSERT ON users_with_deleted
FOR EACH ROW
EXECUTE FUNCTION check_users_project_leader_id3();















INSERT INTO settings (id, election_running) VALUES (1, false) ON CONFLICT DO NOTHING;

COMMIT;
