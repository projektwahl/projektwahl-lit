# Attacks

## Systemd sandboxing

RootDirectory + BindPaths=, BindReadOnlyPaths=

AppArmorProfile=

https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html

LoadCredentialEncrypted=

## Login Hash Calculation DOS

Many login requests probably cause severe memory and cpu pressure as argon2id is compute intensive. Maybe we should ratelimit it.

```bash
sudo apt install apache2-utils -y
echo '{"username":"admin","password":"changeme"}' > post.txt
ab -n 10000 -c 1000 -v 3 -p post.txt -T 'text/json' -m POST -k -H 'x-csrf-protection: projektwahl' http://116.203.125.40:8443/api/v1/login
siege -c50 -t60S --content-type "text/json" 'http://116.203.125.40:8443/api/v1/login POST {"username":"admin","password":"changeme"}' # TODO FIXME csrf header missing

nano wrk.lua
wrk.method = "POST"
wrk.body   = '{"username":"admin","password":"changeme"}'
wrk.headers["Content-Type"] = "text/json"
wrk.headers["x-csrf-protection"] = "projektwahl"

wrk --script wrk.lua http://116.203.125.40:8443/api/v1/login
```


