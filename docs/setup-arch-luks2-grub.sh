# boot into rescue
# https://wiki.archlinux.org/title/Installation_guide
# https://wiki.archlinux.org/title/Install_Arch_Linux_from_existing_Linux
git clone https://github.com/archlinux/arch-install-scripts
cd arch-install-scripts/
apt update
apt install m4
make
