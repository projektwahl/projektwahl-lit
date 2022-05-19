#!/usr/bin/env bash

# TODO FIXME just do this in nodejs using the nodejs lib?
psql -c "CREATE ROLE projektwahl_staging LOGIN PASSWORD 'projektwahl';"
psql -c "CREATE ROLE projektwahl_staging_admin IN ROLE projektwahl_staging LOGIN PASSWORD 'projektwahl';"
psql -c "CREATE DATABASE projektwahl_staging OWNER projektwahl_staging_admin;"
psql --user projektwahl_staging_admin --db projektwahl_staging --single-transaction < /opt/projektwahl-lit/src/server/setup.sql
psql --user projektwahl_staging_admin --db projektwahl_staging -c "UPDATE settings SET open_date = CURRENT_TIMESTAMP + (- '1 minute'::interval), voting_start_date = CURRENT_TIMESTAMP, voting_end_date = CURRENT_TIMESTAMP + '1 hour', results_date = CURRENT_TIMESTAMP + '2 hours';"
