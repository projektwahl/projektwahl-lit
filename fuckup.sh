

psql --u postgres --command="DROP DATABASE projektwahl_staging;"
psql --u postgres --command="CREATE DATABASE projektwahl_staging OWNER projektwahl_staging_admin;"
psql --username projektwahl_staging_admin --set ON_ERROR_STOP=on projektwahl_staging < ~/Documents/Projektwoche/dumps/dump_2022-06-26\ 17\:41\:20.sql
psql --username projektwahl_staging_admin --single-transaction --db projektwahl_staging < src/server/setup.sql
