#!/usr/bin/env bash

# TODO FIXME just do this in nodejs using the nodejs lib?
psql postgres://postgres:postgres@localhost/postgres?host=/var/run/postgresql -c "CREATE ROLE projektwahl_staging LOGIN PASSWORD 'projektwahl';"
psql postgres://postgres:postgres@localhost/postgres?host=/var/run/postgresql -c "CREATE ROLE projektwahl_staging_admin IN ROLE projektwahl_staging LOGIN PASSWORD 'projektwahl';"
psql postgres://postgres:postgres@localhost/postgres?host=/var/run/postgresql -c "CREATE DATABASE projektwahl_staging OWNER projektwahl_staging_admin;"
psql postgres://projektwahl_staging_admin:projektwahl@localhost/projektwahl_staging?host=/var/run/postgresql --single-transaction < /opt/projektwahl-lit/src/server/setup.sql
psql postgres://projektwahl_staging_admin:projektwahl@localhost/projektwahl_staging?host=/var/run/postgresql -c "UPDATE settings SET open_date = CURRENT_TIMESTAMP + (- '1 minute'::interval), voting_start_date = CURRENT_TIMESTAMP, voting_end_date = CURRENT_TIMESTAMP + '1 hour', results_date = CURRENT_TIMESTAMP + '2 hours';"
