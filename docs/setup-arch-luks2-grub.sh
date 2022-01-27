# boot with iso mounted
# https://wiki.archlinux.org/title/Installation_guide
# https://wiki.archlinux.org/title/Install_Arch_Linux_from_existing_Linux
ssh root@168.119.156.152
timedatectl set-ntp true
fdisk /dev/sda
g
n
# ...
w
cryptsetup open --type plain -d /dev/urandom /dev/sda1
dd if=/dev/zero of=/dev/mapper/to_be_wiped status=progress bs=1M 
cryptsetup close to_be_wiped
