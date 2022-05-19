#!/usr/bin/env bash

# TODO FIXME just do this in nodejs using the nodejs lib?
psql -c "CREATE ROLE projektwahl_staging LOGIN PASSWORD 'projektwahl';"
psql -c "CREATE ROLE projektwahl_staging_admin IN ROLE projektwahl_staging LOGIN PASSWORD 'projektwahl';"
psql -c "CREATE DATABASE projektwahl_staging OWNER projektwahl_staging_admin;"
psql --user projektwahl_staging_admin --db projektwahl_staging --single-transaction < /opt/projektwahl-lit/src/server/setup.sql
