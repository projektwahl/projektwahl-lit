# boot with iso mounted
# https://wiki.archlinux.org/title/Installation_guide
# https://wiki.archlinux.org/title/Install_Arch_Linux_from_existing_Linux
ssh root@168.119.156.152
timedatectl set-ntp true

cryptsetup open --type plain -d /dev/urandom /dev/sda
dd if=/dev/zero of=/dev/mapper/to_be_wiped status=progress bs=1M 
cryptsetup close to_be_wiped

sgdisk --clear /dev/sda
sgdisk -n 0:0:+1MiB -t 0:ef02 -c 0:grub /dev/sda
sgdisk -n 0:0:0 -t 0:8300 -c 0:root /dev/sda
sgdisk --print /dev/sda 



# https://wiki.archlinux.org/title/Dm-crypt/Encrypting_an_entire_system#Encrypted_boot_partition_(GRUB)
# https://wiki.archlinux.org/title/GRUB#Encrypted_/boot
cryptsetup luksFormat --type luks2 --pbkdf pbkdf2 /dev/sda2
