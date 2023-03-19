podman build --tag harbor.selfmade4u.de/projektwahl/frontend:latest --target frontend -f Dockerfile
podman push harbor.selfmade4u.de/projektwahl/frontend:latest

helm template --debug projektwahl-test ./helm/ --create-namespace --namespace projektwahl-test

helm upgrade --install projektwahl-test ./helm/ --create-namespace --namespace projektwahl-test

kubectl get -n projektwahl-test all