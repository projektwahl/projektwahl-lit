# Attacks

## Systemd sandboxing

All relevant units (nginx, projektwahl, postgresql) are hardened using systemd.

### nginx

```
✗ RootDirectory=/RootImage=                                   Service runs within the host's root directory                                       0.1
✗ AmbientCapabilities=                                        Service process receives ambient capabilities                                       0.1
✗ RestrictAddressFamilies=~AF_(INET|INET6)                    Service may allocate Internet sockets                                               0.3
✗ CapabilityBoundingSet=~CAP_NET_(BIND_SERVICE|BROADCAST|RAW) Service has elevated networking privileges                                          0.1
✗ PrivateNetwork=                                             Service has access to the host's network                                            0.5
✗ PrivateUsers=                                               Service has access to other users                                                   0.2
✗ DeviceAllow=                                                Service has a device ACL with some special devices                                  0.1
✗ IPAddressDeny=                                              Service does not define an IP address allow list                                    0.2
```

#### Impact of takeover

If the attacker is able to circumvent the MemoryDenyWriteExecute they would probably be able to create services on ports < 1024 (and also above). They could make requests to the internet and use computing resources of the server.

#### Possible improvements

Use socket activation and PrivateNetwork=true.

### postgresql

```
✗ RootDirectory=/RootImage=                                   Service runs within the host's root directory                                       0.1
✗ RestrictAddressFamilies=~AF_UNIX                            Service may allocate local sockets                                                  0.1
✗ RestrictAddressFamilies=~AF_(INET|INET6)                    Service may allocate Internet sockets                                               0.3
✗ DeviceAllow=                                                Service has a device ACL with some special devices                                  0.1
✗ IPAddressDeny=                                              Service defines IP address allow list with only localhost entries                   0.1
```

#### Impact of takeover

They would be able to fully manipulate and read all data (including the data for the projektwahl service). They should not be able to attack much other services on the local system and they should not have any remote network connectivity. They could use computing resources of the server.

#### Possible improvements

Remove the permissions above further so there is only RootDirectory and DeviceAllow left.

# Nginx Reverse Proxy

Prevents leaking the certificate in case the projektwahl service is compromised.

May prevent some attacks by normalizing/denying requests.

## Login Hash Calculation DOS

Many login requests probably cause severe memory and cpu pressure as argon2id is compute intensive. Maybe we should ratelimit it. This would also be a password bruteforce.

Actually I didn't manage to achieve much with the following instructions.

````bash
sudo apt install apache2-utils -y
echo '{"username":"admin","password":"changeme"}' > post.txt
ab -n 10000 -c 1000 -v 3 -p post.txt -T 'text/json' -m POST -k -H 'x-csrf-protection: projektwahl' http://116.203.125.40:8443/api/v1/login
siege -c50 -t60S --header 'x-csrf-protection: projektwahl' --content-type "text/json" 'http://116.203.125.40:8443/api/v1/login POST {"username":"admin","password":"changeme"}'

# cpx11 server so we have more cpu

ulimit -n 1048576

nano wrk.lua
wrk.method = "POST"
wrk.body   = '{"username":"admin","password":"changeme"}'
wrk.headers["Content-Type"] = "text/json"
wrk.headers["x-csrf-protection"] = "projektwahl"

wrk -s wrk.lua --connections 10000 --threads 100 http://116.203.125.40:8443/api/v1/login```


````
