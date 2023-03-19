podman build --tag harbor.selfmade4u.de/projektwahl/frontend:latest --target frontend -f Dockerfile
podman push harbor.selfmade4u.de/projektwahl/frontend:latest

helm template --debug projektwahl-test ./helm/ --create-namespace --namespace projektwahl-test

helm upgrade --debug --install projektwahl-test ./helm/ --create-namespace --namespace projektwahl-test --set image.tag=latest

kubectl get -n projektwahl-test all