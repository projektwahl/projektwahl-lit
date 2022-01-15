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

## Login Hash Calculation DOS

Many login requests probably cause severe memory and cpu pressure as argon2id is compute intensive. Maybe we should ratelimit it.
