ICON + Splash Screen:
npx @capacitor/assets generate

docker buildx build -t frontend:latest .

docker run -p 5000:5000 frontend

docker tag fee4f641e2f02ab16fc9080d7805f42b48077d59c006b7fc0801d63a630eafff snghbeer/sct_jean:frontend
docker push snghbeer/sct_jean:frontend