@echo off
cd ../../huna
helm dependency update --skip-refresh
helm upgrade --install -n huna --create-namespace --values values-local.yaml --values Chart.lock huna .