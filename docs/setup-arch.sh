# hetzner rescue mode
ssh root@162.55.211.18
# https://community.hetzner.com/tutorials/install-ubuntu-2004-with-full-disk-encryption
# https://madflex.de/install-archlinux-on-hetzner-cloud/
# https://github.com/kevinveenbirkenbach/hetzner-arch-luks

CRYPTPASSWORD secret
DRIVE1 /dev/sda
BOOTLOADER grub
HOSTNAME host.example.com
PART /boot ext4 1G
PART /     ext4 all crypt
IMAGE /root/images/Ubuntu-2004-focal-64-minimal.tar.gz
SSHKEYS_URL /tmp/authorized_keys

installimage

