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

glibc is affected by multiple issues. (CVE-2021-43396, CVE-2021-3999, CVE-2021-3998, CVE-2021-35942, CVE-2021-33574, CVE-2021-27645). High risk!
Up to date, unknown if vulnerable.

postgresql is affected by man-in-the-middle. (CVE-2021-23214). High risk!
Already fixed in 13.5 https://www.postgresql.org/support/security/CVE-2021-23214/

apr is affected by information disclosure. (CVE-2021-35940). Medium risk!
Shouldn't be used.

binutils is affected by multiple issues, arbitrary code execution. (CVE-2021-3648, CVE-2021-3530, CVE-2021-20197, CVE-2021-3549). Medium risk!
Should be fixed.

krb5 is affected by denial of service. (CVE-2021-37750). Medium risk!
Shouldn't be used.

libarchive is affected by arbitrary code execution. (CVE-2021-36976). Medium risk!
Already fixed in 3.6.0 https://nvd.nist.gov/vuln/detail/CVE-2021-36976

linux is affected by multiple issues, insufficient validation. (CVE-2021-43976, CVE-2021-4095, CVE-2021-4028, CVE-2021-3847, CVE-2021-3752, CVE-2021-3669, CVE-2021-31615, CVE-2020-26560, CVE-2020-26559, CVE-2020-26557, CVE-2020-26556, CVE-2020-26555, CVE-2020-35501). Medium risk!
Needs update to 5.16.10 (released yesterday)

ncurses is affected by arbitrary code execution. (CVE-2021-39537). Medium risk!
Don't care. sudo pacman -R perl

npm is affected by insufficient validation. (CVE-2021-43616). Medium risk!
Already fixed in 8.5.0 https://nvd.nist.gov/vuln/detail/CVE-2021-43616

perl is affected by signature forgery, directory traversal. (CVE-2020-16156, CVE-2021-36770). Medium risk!
Shouldn't be used.

rsync is affected by arbitrary command execution. (CVE-2021-3755). Medium risk!
Shouldn't be used.

openssh is affected by information disclosure. (CVE-2016-20012). Low risk!
Already fixed in 8.8p1 https://nvd.nist.gov/vuln/detail/CVE-2016-20012

postgresql-libs is affected by man-in-the-middle. (CVE-2021-23222). Low risk!
Already fixed in 13.5 https://www.postgresql.org/support/security/CVE-2021-23222/





pacman -S lynis
sudo lynis audit system


sudo chmod 700 /boot

sudo nano /etc/profile
umask 077

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


# TODO backups



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
sudo -iu postgres initdb -D /var/lib/postgres/data
sudo systemctl --now enable postgresql
sudo pacman -S nodejs npm make gcc

sudo pacman -S nginx-mainline
sudo systemctl enable --now nginx
sudo ufw allow http
sudo ufw allow https


sudo nano /etc/nginx/nginx.conf
# edit server_name aes.selfmade4u.de
sudo pacman -S certbot-nginx
sudo certbot --nginx -d aes.selfmade4u.de -m Moritz.Hedtke@t-online.de --agree-tos -n




sudo -u postgres psql
CREATE ROLE projektwahl LOGIN;
CREATE ROLE projektwahl_admin LOGIN;
CREATE DATABASE projektwahl OWNER projektwahl_admin;


ssh -A moritz@aes.selfmade4u.de -p 2121
sudo useradd -m projektwahl
sudo useradd -m projektwahl_admin
cd /opt
sudo mkdir projektwahl-lit
sudo chown moritz projektwahl-lit
git clone git@github.com:projektwahl/projektwahl-lit.git
cd projektwahl-lit

openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout key.pem -out cert.pem
npm ci --ignore-scripts --omit=optional
npx node-gyp rebuild -C ./node_modules/@dev.mohe/argon2/
npm run build

# These lines need to be repeated all the time... We should probably use ACLs
sudo chown -R moritz:projektwahl /opt/projektwahl-lit
sudo chmod -R u=rwX,g=rX,o= /opt/projektwahl-lit/

ps ax o user,group,gid,pid,%cpu,%mem,vsz,rss,tty,stat,start,time,comm

# TODO FIXME we really should fix this

#sudo setfacl --remove-all --recursive .
#sudo setfacl --set=user::---,group::---,user:moritz:rwX,group:projektwahl:r-X,other::---,mask::--- --recursive --default .
#sudo setfacl --modify=user:moritz:rwX,group:projektwahl:r-X --recursive --default .



sudo -u projektwahl_admin psql --db projektwahl < src/server/setup.sql

# maintenance:
sudo -u projektwahl_admin psql --db projektwahl
SET default_transaction_read_only = false;
\dp


sudo -u projektwahl -i
cd /opt/projektwahl-lit
NODE_ENV=production DATABASE_URL=postgres://projektwahl:projektwahl@localhost/projektwahl node --enable-source-maps dist/setup.cjs


NODE_ENV=production PORT=8443 BASE_URL=https://localhost:8443 DATABASE_URL=postgres://projektwahl:projektwahl@projektwahl/projektwahl CREDENTIALS_DIRECTORY=$PWD node  --enable-source-maps dist/server.cjs




# Backup
set -C
sudo pg_dump --username projektwahl_admin projektwahl > "dump_$(date +"%F %T").sql"

# Recover
sudo psql --username projektwahl_admin --set ON_ERROR_STOP=on projektwahl < dump.sql



sudo nano /etc/systemd/system/projektwahl.service
# https://github.com/projektwahl/projektwahl-lit/blob/work/docs/projektwahl%40.service.conf


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


sudo systemctl daemon-reload && sudo systemctl stop nginx && sudo systemctl start nginx
sudo journalctl -xeu nginx.service



error_log   /var/log/nginx/error.log;
pid        /run/nginx/nginx.pid;
access_log  /var/log/nginx/access.log  main;



https://freedesktop.org/wiki/Software/systemd/DaemonSocketActivation/



# postgres hardening see postgresql.service.override.conf



# TODO FIXME source maps (also enable the command line arg)

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


sudo pacman -S alertmanager
sudo systemctl enable --now alertmanager
 sudo ufw allow 9093

http://168.119.156.152:9093/#/alerts


sudo systemctl enable --now systemd-timesyncd



https://github.com/prometheus-community/postgres_exporter


https://www.observability.blog/nginx-monitoring-with-prometheus/
