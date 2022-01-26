# hetzner rescue mode
ssh root@162.55.211.18
# https://community.hetzner.com/tutorials/install-ubuntu-2004-with-full-disk-encryption
# https://madflex.de/install-archlinux-on-hetzner-cloud/
# https://github.com/kevinveenbirkenbach/hetzner-arch-luks
# https://wiki.archlinux.org/title/Dm-crypt/Specialties#Remote_unlocking_(hooks:_systemd,_systemd-tool)
# https://github.com/random-archer/mkinitcpio-systemd-tool

nano /tmp/setup.conf
DRIVE1 /dev/sda
BOOTLOADER grub
HOSTNAME aes.selfmade4u.de
PART /boot ext4 1G
PART /     ext4 all crypt
IMAGE /root/.oldroot/nfs/install/../images/archlinux-latest-64-minimal.tar.gz
SSHKEYS_URL /tmp/authorized_keys
CRYPTPASSWORD secret

nano /tmp/authorized_keys
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKpm6jXKndgHfeANK/Dipr2f5x75EDY17/NfUieutEJ4 moritz@nixos

nano /tmp/post-install.sh
#!/bin/bash

pacman --noconfirm -S mkinitcpio-systemd-tool tinyssh busybox cryptsetup
cat /etc/mkinitcpio.conf
echo "HOOKS=(base autodetect modconf block filesystems keyboard fsck systemd systemd-tool)" >> /etc/mkinitcpio.conf

#vi /etc/mkinitcpio-systemd-tool/config/crypttab
echo "root           /dev/sda2       none                luks" >> /etc/mkinitcpio-systemd-tool/config/crypttab
#vi /etc/mkinitcpio-systemd-tool/config/fstab
echo "/dev/mapper/root      /sysroot         auto         x-systemd.device-timeout=9999h     0       1" >> /etc/mkinitcpio-systemd-tool/config/fstab
systemctl enable initrd-cryptsetup.path
systemctl enable initrd-tinysshd.service
# systemctl enable initrd-debug-progs.service # really helpful also adds cryptsetup tool
systemctl enable initrd-sysroot-mount.service

mkinitcpio -v -p linux > build.log
lsinitcpio -l /boot/initramfs-linux.img

bash

chmod +x /tmp/post-install.sh

installimage -a -c /tmp/setup.conf -x /tmp/post-install.sh
cat debug.txt

reboot


#script_verbose=info /usr/lib/mkinitcpio-systemd-tool/initrd-shell.sh


#ls /run/systemd/ask-password/

#systemctl list-jobs
#systemd-ask-password

pacman -S sudo
visudo
# uncomment wheel line

useradd -m -G wheel moritz
passwd moritz
exit
ssh-copy-id moritz@162.55.211.18

ssh moritz@162.55.211.18
sudo nano /etc/ssh/sshd_config
Port 2121
PermitRootLogin no      
PasswordAuthentication no
AuthenticationMethods publickey

sudo systemctl restart sshd
ssh moritz@162.55.211.18 -p 2121

sudo pacman -S ufw
sudo ufw default deny
sudo ufw allow 2121
sudo ufw logging off
sudo ufw enable

sudo pacman -S postgresql
sudo -iu postgres initdb -D /var/lib/postgres/data
sudo systemctl --now enable postgresql
sudo pacman -S nodejs

sudo pacman -S nginx-mainline
sudo systemctl enable --now nginx
sudo ufw allow http
sudo ufw allow https


sudo nano /etc/nginx/nginx.conf
# edit server_name aes.selfmade4u.de
sudo pacman -S certbot-nginx
sudo certbot --nginx -d aes.selfmade4u.de -m Moritz.Hedtke@t-online.de --agree-tos -n
