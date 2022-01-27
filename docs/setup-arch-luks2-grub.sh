# boot with iso mounted
# https://wiki.archlinux.org/title/Installation_guide
# https://wiki.archlinux.org/title/Install_Arch_Linux_from_existing_Linux
ssh root@168.119.156.152

cryptsetup open --type plain -d /dev/urandom /dev/sda to_be_wiped
dd if=/dev/zero of=/dev/mapper/to_be_wiped status=progress bs=1M 
cryptsetup close to_be_wiped

sgdisk --clear /dev/sda
sgdisk -n 0:0:+1MiB -t 0:ef02 -c 0:grub /dev/sda
sgdisk -n 0:0:0 -t 0:8300 -c 0:root /dev/sda
sgdisk --print /dev/sda 



# https://wiki.archlinux.org/title/Dm-crypt/Encrypting_an_entire_system#Encrypted_boot_partition_(GRUB)
# https://wiki.archlinux.org/title/GRUB#Encrypted_/boot
cryptsetup luksFormat --type luks2 --pbkdf pbkdf2 /dev/sda2
cryptsetup open /dev/sda2 root
mkfs.ext4 /dev/mapper/root
mount /dev/mapper/root /mnt




pacstrap /mnt base linux
genfstab -U /mnt >> /mnt/etc/fstab
arch-chroot /mnt
pacman -S nano
ln -sf /usr/share/zoneinfo/Europe/Berlin /etc/localtime
hwclock --systohc
nano /etc/locale.gen
locale-gen
nano /etc/locale.conf
LANG=en_US.UTF-8
nano /etc/vconsole.conf
KEYMAP=de-latin1
nano /etc/hostname
arch-luks2

nano /etc/mkinitcpio.conf
HOOKS=(base udev autodetect keyboard keymap consolefont modconf block encrypt filesystems fsck)

mkinitcpio -P

passwd

pacman -S grub

nano /etc/default/grub
GRUB_ENABLE_CRYPTODISK=y

blkid
nano /etc/default/grub
GRUB_CMDLINE_LINUX="... cryptdevice=UUID=ac3767c9-c918-40e1-be26-57224f756c2f:root ..."

grub-install --target=i386-pc --recheck /dev/sda

grub-mkconfig -o /boot/grub/grub.cfg

# https://wiki.archlinux.org/title/Systemd-networkd

systemctl enable systemd-networkd
nano /etc/systemd/network/20-wired.network
[Match] 
Name=en*   

[Network]
Address=168.119.156.152/32
Gateway=172.31.1.1
DNS=185.12.64.1 185.12.64.2
