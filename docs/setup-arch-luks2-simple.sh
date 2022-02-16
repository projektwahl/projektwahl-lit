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


pacman -S openssh
systemctl enable sshd



pacman -S arch-audit
arch-audit

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

npm ci # --omit optional we should probably put some more into dev dependencies (for building)
(cd ./node_modules/@dev.mohe/argon2 && node-gyp rebuild)
npm run localize-build
npm run build
npm run purgecss

openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout key.pem -out cert.pem

# These lines need to be repeated all the time... We should probably use ACLs
sudo chown -R moritz:projektwahl /opt/projektwahl-lit
sudo chmod -R u=rwX,g=rX,o= /opt/projektwahl-lit/

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
DATABASE_URL=postgres://projektwahl:projektwahl@localhost/projektwahl npm run setup




# Backup
set -C
sudo pg_dump --username projektwahl_admin projektwahl > "dump_$(date +"%F %T").sql"

# Recover
sudo psql --username projektwahl_admin --set ON_ERROR_STOP=on projektwahl < dump.sql



sudo nano /etc/systemd/system/projektwahl.service
# https://github.com/projektwahl/projektwahl-lit/blob/work/docs/projektwahl%40.service.conf


sudo systemctl show projektwahl.service | grep --color Device

