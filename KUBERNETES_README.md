podman login harbor.selfmade4u.de

podman build --tag harbor.selfmade4u.de/projektwahl/frontend:pull-4fb00eb4e1fe874a8f7cb94330cf652c8cffb219 --target frontend -f Dockerfile
podman push harbor.selfmade4u.de/projektwahl/frontend:pull-4fb00eb4e1fe874a8f7cb94330cf652c8cffb219

helm template --debug projektwahl-test ./helm/ --create-namespace --namespace projektwahl-test

helm upgrade --debug --install projektwahl-test ./helm/ --create-namespace --namespace projektwahl-test --set image.tag=latest

kubectl get -n projektwahl-test all