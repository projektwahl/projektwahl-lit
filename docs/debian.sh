ssh root@x.x.x.x
apt update
apt upgrade -y
reboot

ssh root@x.x.x.x
sudo adduser moritz
mkdir /home/moritz/.ssh
chmod 700 /home/moritz/.ssh
sudo cp /root/.ssh/authorized_keys /home/moritz/.ssh/authorized_keys
sudo chown -R moritz:moritz /home/moritz/.ssh
sudo chmod 600 /home/moritz/.ssh/authorized_keys
usermod -a -G sudo moritz
exit

ssh -A moritz@x.x.x.x
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs gcc g++ make git postgresql certbot chromium p7zip-full

sudo certbot certonly --standalone

cd /opt
sudo mkdir projektwahl-lit
sudo chown moritz:moritz projektwahl-lit
git clone git@github.com:projektwahl/projektwahl-lit.git
cd projektwahl-lit
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-privkey.pem -out localhost-cert.pem
npm ci
npx node-pre-gyp rebuild -C ./node_modules/argon2
npm run localize-build
npm run build
npm run purgecss


curl -OL https://chromedriver.storage.googleapis.com/97.0.4692.71/chromedriver_linux64.zip
7z x chromedriver_linux64.zip
npm run test



pg_dumpall > outputfile # https://www.postgresql.org/docs/14/upgrading.html


# TODO https://www.postgresql.org/docs/14/preventing-server-spoofing.html

# https://www.postgresql.org/docs/14/runtime-config-replication.html


# https://www.postgresql.org/docs/14/client-authentication.html

# https://www.postgresql.org/docs/14/database-roles.html

sudo -u postgres psql
CREATE ROLE projektwahl LOGIN PASSWORD 'projektwahl';
\du
\l
CREATE DATABASE projektwahl;



# https://www.postgresql.org/docs/14/routine-vacuuming.html autovacuuming is enabled for us


# https://www.postgresql.org/docs/14/backup.html


# https://www.postgresql.org/docs/14/high-availability.html

# https://www.postgresql.org/docs/14/logical-replication-restrictions.html seems like logical replication would not be what we want

# https://www.postgresql.org/docs/14/monitoring.html

# https://www.postgresql.org/docs/current/ddl-priv.html

sudo -u postgres psql --db projektwahl < src/server/setup.sql

\dp

sudo -u postgres psql --db projektwahl
SET default_transaction_read_only = false;
GRANT SELECT,INSERT,UPDATE ON users_with_deleted TO projektwahl;
GRANT SELECT,INSERT,UPDATE ON users TO projektwahl;
GRANT SELECT,INSERT,UPDATE ON projects_with_deleted TO projektwahl;
GRANT SELECT,INSERT,UPDATE ON projects TO projektwahl;
GRANT SELECT,INSERT,UPDATE ON choices TO projektwahl;
GRANT SELECT,INSERT,UPDATE ON sessions TO projektwahl;

DATABASE_URL=postgres://projektwahl:projektwahl@localhost/projektwahl npm run setup


sudo nano /etc/systemd/system/projektwahl.service

sudo systemctl daemon-reload
sudo systemctl enable projektwahl.service
sudo systemctl start projektwahl.service
# https://x.x.x.x:8443
sudo systemctl restart projektwahl.service

# https://stackoverflow.com/questions/68303671/systemd-socket-activation-sd-listen-fds-return-0-fd
# sounds like nodejs is doing more than it should (just call accept)

# https://github.com/nodejs/node/blob/162cc4fa6303e3dd3a1f7ec041f9aa073a40d7d7/lib/net.js#L1237

# NODE_DEBUG=* DATABASE_URL=postgres://projektwahl:projektwahl@projektwahl/projektwahl npm run server

https://github.com/nodejs/node/blob/0e561de643ab38c6a3b5c9912c2abd0b1527c14c/src/node_util.cc#L257

https://github.com/libuv/libuv/blob/b6d51dc40eb420d81a28c3b3c7b6de4ee9319dfc/src/unix/tty.c#L333

sudo lsns

sudo lsns --type=net
sudo nsenter -t 645 -n /bin/bash

netstat -c
