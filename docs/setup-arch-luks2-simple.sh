# SPDX-License-Identifier: AGPL-3.0-or-later
# SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
# boot with iso mounted
# https://wiki.archlinux.org/title/Installation_guide
# https://wiki.archlinux.org/title/Install_Arch_Linux_from_existing_Linux
# https://wiki.archlinux.org/title/Dm-crypt/Encrypting_an_entire_system
ssh root@168.119.156.152

cryptsetup open --type plain -d /dev/urandom /dev/sda to_be_wiped
dd if=/dev/zero of=/dev/mapper/to_be_wiped status=progress bs=1M 
cryptsetup close to_be_wiped

sgdisk --clear /dev/sda
sgdisk -n 0:0:+1MiB -t 0:ef02 -c 0:grub /dev/sda
sgdisk -n 0:0:+512MiB -t 0:ea00 -c 0:boot /dev/sda
sgdisk -n 0:0:0 -t 0:8300 -c 0:root /dev/sda
sgdisk --print /dev/sda 

cryptsetup luksFormat --type luks2 /dev/sda3
cryptsetup open /dev/sda3 root
mkfs.ext4 /dev/mapper/root
mount /dev/mapper/root /mnt

mkfs.ext4 /dev/sda2
mkdir /mnt/boot
mount /dev/sda2 /mnt/boot

pacstrap /mnt base linux
genfstab -U /mnt >> /mnt/etc/fstab
arch-chroot /mnt
ln -sf /usr/share/zoneinfo/Europe/Berlin /etc/localtime
hwclock --systohc
echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen
echo "LANG=en_US.UTF-8" >> /etc/locale.conf
echo "KEYMAP=de-latin1" >> /etc/vconsole.conf
echo "arch-luks2" >> /etc/hostname

echo "HOOKS=(base udev autodetect keyboard keymap consolefont modconf block encrypt filesystems fsck)" >> /etc/mkinitcpio.conf

mkinitcpio -P

passwd

pacman -S --noconfirm nano grub

blkid | grep /dev/sda3
echo 'GRUB_CMDLINE_LINUX="cryptdevice=UUID=a1109faa-dca2-4ccd-857b-7ce4e663a91e:root root=/dev/mapper/root"' >> /etc/default/grub

grub-install --target=i386-pc --recheck /dev/sda

grub-mkconfig -o /boot/grub/grub.cfg

# https://wiki.archlinux.org/title/Systemd-networkd

systemctl enable systemd-networkd
nano /etc/systemd/network/20-wired.network
[Match] 
Name=en*

[Network]
Address=2a01:4f8:c010:4c33::1/64
Gateway=172.31.1.1
Gateway=fe80::1
DNS=185.12.64.1
DNS=185.12.64.2
LLMNR=no

[Address]
Address=168.119.156.152/32
Peer=172.31.1.1/32



sudo nano /etc/systemd/resolved.conf
LLMNR=no


systemctl enable systemd-resolved

# https://wiki.archlinux.org/title/Systemd-resolved
breaks gnupg by default ough
sudo ln -rsf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf


pacman -S openssh
systemctl enable sshd



pacman -S arch-audit
arch-audit

apr is affected by information disclosure. Medium risk!
curl is affected by multiple issues. Medium risk!
linux is affected by multiple issues, insufficient validation. Medium risk!
perl is affected by signature forgery, directory traversal. Medium risk!
rsync is affected by arbitrary command execution. Medium risk!




pacman -S lynis
sudo lynis audit system


sudo chmod 700 /boot

# don't do this this breaks lots of user workflows
#sudo nano /etc/profile
#umask 077

# https://wiki.archlinux.org/title/Security
sudo nano /etc/sysctl.d/42-my-hardenings.conf
kernel.kptr_restrict=1
net.core.bpf_jit_harden=2
kernel.unprivileged_bpf_disabled=1
kernel.kexec_load_disabled=1
kernel.unprivileged_userns_clone=0



sudo nano /etc/default/grub
GRUB_CMDLINE_LINUX_DEFAULT="lockdown=confidentiality kernel.yama.ptrace_scope=2 module.sig_enforce=1"
sudo grub-mkconfig -o /boot/grub/grub.cfg


sudo nano /etc/fstab
proc	/proc	proc	nosuid,nodev,noexec,hidepid=2,gid=proc	0	0


# https://security.archlinux.org/



# TODO DNSSEC
# TODO nginx A+ ssllabs




# TODO https://wiki.archlinux.org/title/AppArmor
pacman -S apparmor
sudo systemctl enable --now apparmor
cat /sys/kernel/security/lsm # on the arch not the installer system
nano /etc/default/grub
GRUB_CMDLINE_LINUX_DEFAULT="lsm=landlock,lockdown,yama,apparmor,bpf"
grub-mkconfig -o /boot/grub/grub.cfg

exit
sudo umount /mnt/boot
sudo umount /mnt
cryptsetup close root
reboot

# recover from liveiso
mount /dev/sda3 /mnt
mount /dev/sda2 /mnt/boot
arch-chroot /mnt
cryptsetup close root









pacman -S sudo
visudo
# uncomment wheel line

useradd -m -G wheel moritz
passwd moritz
exit
ssh-copy-id moritz@168.119.156.152

ssh moritz@168.119.156.152
sudo nano /etc/ssh/sshd_config
Port 2121
PermitRootLogin no      
PasswordAuthentication no
AuthenticationMethods publickey


AllowTcpForwarding no
ClientAliveCountMax 2
Compression no
LogLevel verbose
MaxAuthTries 3
MaxSessions 2
TCPKeepAlive no



sudo systemctl restart sshd
ssh moritz@168.119.156.152 -p 2121

sudo pacman -S ufw
sudo ufw default deny
sudo ufw allow 2121
sudo ufw logging off
sudo ufw enable

sudo pacman -S postgresql
sudo -iu postgres initdb --data-checksums -D /var/lib/postgres/data
sudo systemctl --now enable postgresql
sudo pacman -S nodejs npm make gcc

sudo pacman -S nginx-mainline
sudo systemctl enable --now nginx
sudo ufw allow http
sudo ufw allow https


# TODO see hardening at https://wiki.archlinux.org/title/nginx
sudo nano /etc/nginx/nginx.conf # replace with file in repo
sudo mkdir /etc/nginx/sites-available
sudo mkdir /etc/nginx/sites-enabled

sudo nano /etc/nginx/sites-available/projektwahl-staging.conf
# staging-aes.selfmade4u.de
# /opt/projektwahl-lit-staging
# https://localhost:7443;

sudo nano /etc/nginx/sites-available/projektwahl-production.conf
# aes.selfmade4u.de
# /opt/projektwahl-lit-production
# https://localhost:8443;

sudo ln -s /etc/nginx/sites-available/projektwahl-staging.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/projektwahl-production.conf /etc/nginx/sites-enabled/




sudo systemctl edit nginx
sudo systemd-analyze security nginx

sudo useradd nginx
sudo usermod -a -G projektwahl nginx
sudo setfacl --modify=user:nginx:r-- /etc/letsencrypt/live/aes.selfmade4u.de/fullchain.pem
sudo setfacl --modify=user:nginx:r-- /etc/letsencrypt/live/aes.selfmade4u.de/privkey.pem
sudo setfacl --modify=user:nginx:r-X /etc/letsencrypt/archive
sudo setfacl --modify=user:nginx:r-X /etc/letsencrypt/archive/aes.selfmade4u.de/
sudo setfacl --modify=user:nginx:r-X /etc/letsencrypt/live
sudo setfacl --modify=user:nginx:r-X /etc/letsencrypt/live/aes.selfmade4u.de/

sudo chown -R nginx:nginx /var/log/nginx/

# TODO https://docs.nginx.com/nginx/admin-guide/dynamic-modules/brotli/
sudo pacman -S nginx-mod-brotli nginx-mod-headers-more

sudo systemctl daemon-reload && sudo systemctl stop nginx && sudo systemctl start nginx
sudo journalctl -xeu nginx.service




sudo pacman -S certbot-nginx
sudo certbot --nginx -d aes.selfmade4u.de -d staging-aes.selfmade4u.de -m Moritz.Hedtke@t-online.de --agree-tos -n



sudo -u postgres psql
CREATE ROLE projektwahl_staging LOGIN;
CREATE ROLE projektwahl_staging_admin IN ROLE projektwahl_staging LOGIN;
CREATE ROLE projektwahl_production LOGIN;
CREATE ROLE projektwahl_production_admin IN ROLE projektwahl_production LOGIN;
CREATE DATABASE projektwahl_staging OWNER projektwahl_staging_admin;
CREATE DATABASE projektwahl_production OWNER projektwahl_production_admin;


sudo -u postgres psql --db projektwahl_staging
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT CREATE ON SCHEMA public TO projektwahl_staging_admin;


sudo -u postgres psql --db projektwahl_production
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT CREATE ON SCHEMA public TO projektwahl_production_admin;


ssh -A moritz@aes.selfmade4u.de -p 2121
sudo useradd -m projektwahl_staging
sudo useradd -m projektwahl_staging_admin
sudo useradd -m projektwahl_production
sudo useradd -m projektwahl_production_admin
cd /opt
sudo mkdir projektwahl-lit-staging
sudo chown moritz projektwahl-lit-staging
git clone git@github.com:projektwahl/projektwahl-lit.git projektwahl-lit-staging
cd projektwahl-lit-staging
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout key.pem -out cert.pem
npm ci --ignore-scripts --omit=optional
./node_modules/@dev.mohe/argon2/build.sh /usr/include/node/
LANGUAGE=de npm run build

sudo mkdir projektwahl-lit-production
sudo chown moritz projektwahl-lit-production
git clone git@github.com:projektwahl/projektwahl-lit.git projektwahl-lit-production
cd projektwahl-lit-production
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout key.pem -out cert.pem
npm ci --ignore-scripts --omit=optional
./node_modules/@dev.mohe/argon2/build.sh /usr/include/node/
LANGUAGE=de npm run build



sudo -u projektwahl_staging_admin psql --single-transaction --db projektwahl_staging < src/server/setup.sql
sudo -u projektwahl_production_admin psql --single-transaction --db projektwahl_production < src/server/setup.sql


# Backup
set -C
sudo pg_dump --no-acl --no-owner --username projektwahl_production_admin projektwahl_production > "dump_$(date +"%F %T").sql"

rsync --verbose -r -e 'ssh -p 2121' moritz@aes.selfmade4u.de:~/dumps/ /home/moritz/Documents/Projektwoche/dumps/

# Recover
sudo psql --username projektwahl_staging_admin --set ON_ERROR_STOP=on projektwahl_staging < dump.sql
# TODO manually fixup ACLs with the above instructions






sudo -u projektwahl_staging -i
cd /opt/projektwahl-lit-staging
NODE_ENV=production DATABASE_HOST=/run/postgresql DATABASE_URL=postgres://projektwahl_staging:projektwahl_staging@localhost/projektwahl_staging node --enable-source-maps dist/setup.js



sudo -u projektwahl_production -i
cd /opt/projektwahl-lit-production
NODE_ENV=production DATABASE_HOST=/run/postgresql DATABASE_URL=postgres://projektwahl_production:projektwahl_production@localhost/projektwahl_production node --enable-source-maps dist/setup.js





NODE_ENV=production PORT=8443 BASE_URL=https://localhost:8443 DATABASE_URL=postgres://projektwahl:projektwahl@projektwahl/projektwahl CREDENTIALS_DIRECTORY=$PWD node  --enable-source-maps dist/server.cjs




sudo nano /etc/systemd/system/projektwahl.service
# https://github.com/projektwahl/projektwahl-lit/blob/work/docs/projektwahl%40.service.conf

sudo systemctl edit --full --force projektwahl@.service

sudo systemctl edit --full --force projektwahl@.socket
sudo systemctl enable --now projektwahl@staging.socket
sudo systemctl enable --now projektwahl@production.socket

sudo systemctl edit projektwahl@staging.socket
[Socket]
ListenStream=127.0.0.1:7443

sudo systemctl edit projektwahl@production.socket
[Socket]
ListenStream=127.0.0.1:8443

sudo systemctl start projektwahl@production.socket
sudo systemctl start projektwahl@staging.socket



sudo systemctl show projektwahl.service | grep --color Device





sudo nano /etc/makepkg.conf 
# makeflags

# https://wiki.archlinux.org/title/Arch_Build_System
sudo pacman -S asp
# https://wiki.archlinux.org/title/DeveloperWiki:Building_in_a_clean_chroot


asp checkout linux
cd linux/trunk/
CHROOT=$HOME/chroot makechrootpkg -c -r $CHROOT


# hack
sudo nano /usr/share/makepkg/source/git.sh 
# if ! git clone --mirror --single-branch --depth 1 "$url" "$dir"; then

makechrootpkg -c -r $HOME/chroot -- --holdver



sudo pacman -S devtools pacman-contrib
updpkgsums

# postgresql 13.6
sudo pacman -U *.tar.zst



sudo nano /var/lib/postgres/data/postgresql.conf
listen_addresses = ''

sudo systemctl restart postgresql


sudo systemctl edit --full projektwahl.service

sudo systemctl daemon-reload && sudo systemctl restart projektwahl.socket && sudo systemctl stop projektwahl.service







https://freedesktop.org/wiki/Software/systemd/DaemonSocketActivation/



# postgres hardening see postgresql.service.override.conf



# TODO FIXME source maps (also enable the command line arg)

# probably don't do this - the benefits are marginal and the it's pretty annoying

sudo rm -Rf /opt/projektwahl-container
sudo mkdir /opt/projektwahl-container
sudo pacstrap -c /opt/projektwahl-container nodejs
sudo mkdir -p /opt/projektwahl-container/opt/projektwahl-lit/dist/
sudo cp /opt/projektwahl-lit/dist/server.js /opt/projektwahl-container/opt/projektwahl-lit/dist/server.mjs
sudo cp /opt/projektwahl-lit/dist/*.node /opt/projektwahl-container/opt/projektwahl-lit/dist/

sudo chmod 755 /opt/projektwahl-container/
sudo chmod 755 /opt/projektwahl-container/opt/projektwahl-lit/
sudo chmod 755 /opt/projektwahl-container/opt/projektwahl-lit/dist/
sudo chmod 644 /opt/projektwahl-container/opt/projektwahl-lit/dist/*





# https://wiki.archlinux.org/title/Prometheus
sudo pacman -S prometheus prometheus-node-exporter
sudo nano /etc/prometheus/prometheus.yml
 scrape_configs:
   - job_name: 'prometheus'
     static_configs:
       - targets: ['localhost:9090']
   - job_name: 'localhost'
     static_configs:
       - targets: ['localhost:9100']
sudo systemctl enable --now prometheus prometheus-node-exporter
sudo ufw allow 9090

168.119.156.152:9090


sudo pacman -S grafana
sudo systemctl enable --now grafana
sudo ufw allow 3000

168.119.156.152:3000

# https://wiki.archlinux.org/title/Grafana


curl -OL https://grafana.com/oss/prometheus/exporters/node-exporter/assets/node_rules.yaml
sudo mv node_rules.yaml /etc/prometheus/
sudo nano /etc/prometheus/prometheus.yml 
sudo chown root:prometheus /etc/prometheus/node_rules.yaml
sudo chmod 640 /etc/prometheus/node_rules.yaml
sudo systemctl restart prometheus

curl -OL https://grafana.com/oss/prometheus/exporters/node-exporter/assets/node_alerts.yaml
sudo mv node_alerts.yaml /etc/prometheus/
sudo nano /etc/prometheus/prometheus.yml 
sudo chown root:prometheus /etc/prometheus/node_alerts.yaml
sudo chmod 640 /etc/prometheus/node_alerts.yaml

sudo nano /etc/prometheus/node_alerts.yaml
# remove all for:

sudo systemctl restart prometheus

https://grafana.com/oss/prometheus/exporters/node-exporter/?tab=dashboards

# 13978
# 13971
# 13977



  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']


https://grafana.com/grafana/dashboards/1860

sudo nano /etc/conf.d/prometheus-node-exporter
NODE_EXPORTER_ARGS="--collector.systemd --collector.processes"
sudo systemctl restart prometheus-node-exporter

https://monitoring.mixins.dev/node-exporter/

# SET THE TIME ZONE TO UTC because otherwise it's broken


sudo pacman -S alertmanager
sudo systemctl enable --now alertmanager
 sudo ufw allow 9093

http://168.119.156.152:9093/#/alerts


sudo systemctl enable --now systemd-timesyncd



https://github.com/prometheus-community/postgres_exporter

cd /opt
sudo mkdir postgres_exporter
sudo chown moritz postgres_exporter/
git clone https://github.com/prometheus-community/postgres_exporter.git
cd postgres_exporter/
sudo pacman -S which go
make build
sudo chown -R postgres:postgres /opt/postgres_exporter
sudo chmod -R u=rX,g=rX,o= /opt/postgres_exporter

sudo systemctl edit --full --force prometheus-postgresql-exporter
sudo systemctl enable --now prometheus-postgresql-exporter





sudo nano /etc/prometheus/prometheus.yml 
  - job_name: 'postgresql'
    static_configs:
      - targets: ['localhost:9187']
      
      
https://grafana.com/grafana/dashboards/9628

https://www.observability.blog/nginx-monitoring-with-prometheus/


sudo nano /etc/nginx/sites-available/nginx-monitoring.conf
server {
  listen 8080;

  stub_status;
}

sudo ln -s /etc/nginx/sites-available/nginx-monitoring.conf /etc/nginx/sites-enabled/



# https://github.com/prometheus/blackbox_exporter
sudo pacman -S prometheus-blackbox-exporter
curl -o blackbox.yml https://raw.githubusercontent.com/prometheus/blackbox_exporter/master/blackbox.yml
sudo mv blackbox.yml /etc/prometheus/
sudo nano /etc/prometheus/blackbox.yml
modules:
  http_post_2xx:
    http:
      headers:
        x-csrf-protection: projektwahl
      body: "{}"

sudo systemctl enable --now prometheus-blackbox-exporter

sudo nano /etc/prometheus/prometheus.yml
  - job_name: 'blackbox'
    metrics_path: /probe
    params:
      module: [http_post_2xx]  # Look for a HTTP 200 response.
    static_configs:
      - targets:
        - https://aes.selfmade4u.de/api/v1/login
        - https://staging-aes.selfmade4u.de/api/v1/login
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: 127.0.0.1:9115  # The blackbox exporter's real hostname:port.


sudo systemctl reload prometheus


https://grafana.com/grafana/dashboards/7587



# TODO package with arch / search in aur
cd /opt
sudo mkdir nginx-prometheus-exporter
sudo chown moritz nginx-prometheus-exporter/
git clone https://github.com/nginxinc/nginx-prometheus-exporter
cd nginx-prometheus-exporter
make
sudo systemctl edit --full --force prometheus-nginx-exporter
sudo systemctl enable --now prometheus-nginx-exporter

# https://github.com/nginxinc/nginx-prometheus-exporter/blob/master/grafana/README.md

sudo nano /etc/prometheus/prometheus.yml
  - job_name: 'nginx'
    static_configs: 
      - targets: ['localhost:9113']
      
      
# https://github.com/nginxinc/nginx-prometheus-exporter/blob/master/grafana/dashboard.json
      
      
      
      
      
    DEBUGINFOD_URLS="https://debuginfod.archlinux.org/" sudo coredumpctl debug




sudo pacman -S dust








cd /opt
sudo mkdir go-neb
sudo chown moritz go-neb
git clone https://github.com/matrix-org/go-neb
cd go-neb
sudo pacman -S libolm
go build github.com/matrix-org/go-neb

# https://github.com/matrix-org/go-neb

sudo systemctl edit --full --force alertmanager-matrix
sudo systemctl enable --now alertmanager-matrix

curl -X POST --header 'Content-Type: application/json' -d '{
    "identifier": { "type": "m.id.user", "user": "moritz.hedtke-bot" },
    "password": "PASSWORD",
    "type": "m.login.password"
}' 'https://matrix-federation.matrix.org:443/_matrix/client/r0/login'
curl -X POST localhost:4050/admin/configureClient --data-binary '{
    "UserID": "@moritz.hedtke-bot:matrix.org",
    "HomeserverURL": "https://matrix-federation.matrix.org:443",
    "AccessToken": "<access_token>",
    "DeviceID": "<DEVICEID>",
    "Sync": true,
    "AutoJoinRooms": true,
    "DisplayName": "moritz.hedtke bot"
}'

curl -X POST localhost:4050/admin/configureService --data-binary '{
    "Type": "echo",
    "Id": "echo-service",
    "UserID": "@moritz.hedtke-bot:matrix.org",
    "Config": {}
}'

curl -X POST localhost:4050/admin/configureService --data-binary '{
    "Type": "alertmanager",
    "Id": "alertmanager-service",
    "UserID": "@moritz.hedtke-bot:matrix.org",
    "Config": {
      "Rooms": {
        "!BAfGIGsMNSLsWXypLP:matrix.org": {
          "text_template": "{{range .Alerts -}} [{{ .Status }}] {{index .Labels \"alertname\" }}: {{index .Annotations \"description\"}} {{ end -}}",
          "html_template": "{{range .Alerts -}}  {{ $severity := index .Labels \"severity\" }}    {{ if eq .Status \"firing\" }}      {{ if eq $severity \"critical\"}}        <font color='red'><b>[FIRING - CRITICAL]</b></font>      {{ else if eq $severity \"warning\"}}        <font color='orange'><b>[FIRING - WARNING]</b></font>      {{ else }}        <b>[FIRING - {{ $severity }}]</b>      {{ end }}    {{ else }}      <font color='green'><b>[RESOLVED]</b></font>    {{ end }}  {{ index .Labels \"alertname\"}} : {{ index .Annotations \"description\"}}   <a href=\"{{ .GeneratorURL }}\">source</a><br/>{{end -}}",
          "msg_type": "m.text"
        }
      }
    }
}'


# http://localhost:4050/services/hooks/YWxlcnRtYW5hZ2VyLXNlcnZpY2U

sudo nano /etc/alertmanager/alertmanager.yml
receivers:
- name: 'web.hook'
  webhook_configs:
  - url: 'http://localhost:4050/services/hooks/YWxlcnRtYW5hZ2VyLXNlcnZpY2U'



sudo pacman -S gdu
gdu /

# https://wiki.archlinux.org/title/pacman#Cleaning_the_package_cache
sudo paccache --remove --keep 1
sudo paccache --remove --uninstalled --keep 0

sudo journalctl --vacuum-time=1days






sudo nano /etc/alertmanager/alertmanager.yml
route:
  group_by: [ 'alertname' ]
  group_wait: 1s
  group_interval: 1s
  repeat_interval: 10m
  receiver: 'web.hook'
receivers:
- name: 'web.hook'
  webhook_configs:
  - url: 'http://localhost:4050/services/hooks/YWxlcnRtYW5hZ2VyLXNlcnZpY2U'


sudo nano /etc/prometheus/prometheus.yml
/opt/projektwahl-lit-staging/docs/my_alerts.yaml


sudo nano /opt/projektwahl-lit-staging/docs/my_alerts.yaml && sudo systemctl reload prometheus




# Debugging nodejs performance
# https://nodejs.org/en/docs/guides/debugging-getting-started/
sudo systemctl edit projektwahl@production.service

[Service]
ExecStart=
ExecStart=node --inspect --enable-source-maps /opt/projektwahl-lit-%i/dist/server.js
PrivateNetwork=false
RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6
IPAddressAllow=localhost
SocketBindAllow=any

sudo systemctl daemon-reload
sudo systemctl stop projektwahl@production.service

ss -tulpn | grep 9229


ssh -L 9221:localhost:9229 moritz@aes.selfmade4u.de -p 2121

# chrome://inspect




sudo systemd-creds encrypt --with-key=host - openid_client_secret



# POSTGRESQL major update

# MAKE A BACKUP BEFORE



sudo -u postgres pg_dumpall > /tmp/outputfile

# https://www.postgresql.org/docs/current/upgrading.html
# https://wiki.archlinux.org/title/PostgreSQL#Upgrading_PostgreSQL

sudo systemctl stop projektwahl@production.socket
sudo systemctl stop postgresql

sudo mv /var/lib/postgres/data /var/lib/postgres/olddata
sudo mkdir /var/lib/postgres/data
sudo chown postgres:postgres /var/lib/postgres/data
sudo -u postgres initdb -D /var/lib/postgres/data

sudo systemctl start postgresql

sudo -u postgres psql -d postgres -f /tmp/outputfile



## DEBUGGING systemd sandboxing
sudo systemctl log-level debug

# SIGSYS means SystemCallFilter is at fault
# https://www.freedesktop.org/software/systemd/man/systemd.exec.html#SystemCallFilter=

systemd-analyze syscall-filter



# Data corruption checking
sudo -u postgres pg_amcheck --verbose --install-missing --progress --all --heapallindexed --parent-check --rootdescend

