docker buildx build -t myrabbit .

docker run -d -p 34046:15672 -p 5672:5672 -v ~/.docker-conf/rabbitmq/data/:/var/lib/rabbitmq/data rabbitmq

docker tag 2ab8182b6328 snghbeer/snghbeer:rabbitmq
docker push snghbeer/snghbeer:rabbitmq



