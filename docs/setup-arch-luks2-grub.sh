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
sgdisk -n 0:0:0 -t 0:8300 -c 0:root /dev/sda
sgdisk --print /dev/sda 



# https://wiki.archlinux.org/title/Dm-crypt/Encrypting_an_entire_system#Encrypted_boot_partition_(GRUB)
# seems to work badly without lvm
# https://wiki.archlinux.org/title/GRUB#Encrypted_/boot
cryptsetup luksFormat --type luks2 --pbkdf pbkdf2 /dev/sda2
cryptsetup open /dev/sda2 root
mkfs.ext4 /dev/mapper/root
mount /dev/mapper/root /mnt




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
 
echo "GRUB_ENABLE_CRYPTODISK=y" >> /etc/default/grub

blkid
echo 'GRUB_CMDLINE_LINUX="cryptdevice=UUID=7d91ab1b-e428-441f-aa58-477586e04d13:root"' >> /etc/default/grub

GRUB_PRELOAD_MODULES="part_gpt part_msdos luks cryptodisk lvm ext2"

grub-install --target=i386-pc --modules="part_gpt part_msdos luks cryptodisk lvm ext2" --recheck /dev/sda

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



# recover from liveiso
cryptsetup open /dev/sda2 root
mount /dev/mapper/root /mnt
arch-chroot /mnt
