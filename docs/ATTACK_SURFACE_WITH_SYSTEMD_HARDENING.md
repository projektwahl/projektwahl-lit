# Attacks

## Systemd sandboxing

/run, /sys, /tmp

ExecSearchPath

RootDirectory + BindPaths=, BindReadOnlyPaths=¶

AppArmorProfile=¶

https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#

ProtectSystem=strict

PrivateTmp=yes

PrivateIPC=true

RestrictFileSystems=¶

RestrictSUIDSGID=true

RemoveIPC=true

PrivateMounts=true

LoadCredentialEncrypted
