BUILD image:


npm run tsc
cp package.json, .env and all non-js files into dist folder (because npm run tsc only transpiles ts into js)
cd dist

docker buildx build -t stripeserver:slim .

PUSH image to repo:
docker login

docker tag 501587fa0ff3 snghbeer/nivon:stripeserver

docker push snghbeer/nivon:stripeserver

docker tag fe2e0d14a8c97a228810571b1c4fa7a486c299726e5b33e83400525816bb44ff snghbeer/sct_jean:stripeserver
docker push snghbeer/sct_jean:stripeserver

"docker run -p 3002:80 stripeserver:slim"