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

pacman -S mkinitcpio-systemd-tool
cat /etc/mkinitcpio.conf
echo "HOOKS=(base autodetect modconf block filesystems keyboard fsck systemd systemd-tool)" > /etc/mkinitcpio.conf

edit /etc/mkinitcpio-systemd-tool/config/crypttab
edit /etc/mkinitcpio-systemd-tool/config/fstab
systemctl enable initrd-cryptsetup.path
systemctl enable initrd-tinysshd.service
systemctl enable initrd-debug-progs.service
systemctl enable initrd-sysroot-mount.service

mkinitcpio -v -p linux > build.log
lsinitcpio -l /boot/initramfs-linux.img

chmod +x /tmp/post-install.sh


installimage -a -c /tmp/setup.conf -x /tmp/post-install.sh

