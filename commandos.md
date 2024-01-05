minikube start

minikube stop


kubectl apply -f mongodb-claim0-persistentvolumeclaim.yaml,mongodb-deployment.yaml,config-volume-persistentvolumeclaim.yaml,rabbitmq-claim0-persistentvolumeclaim.yaml,rabbitmq-deployment.yaml,orderserver-deployment.yaml,stripeserver-deployment.yaml

kubectl apply -f frontend-deployment.yaml
kubectl delete -f frontend-deployment.yaml

kubectl delete -f rabbitmq-deployment.yaml,mongodb-deployment.yaml,stripeserver-deployment.yaml,orderserver-deployment.yaml

kubectl get deployments
minikube service orderserver
minikube service frontend


kubectl get pods
kubectl exec -it frontend-97cf8bf44-gp2cb   -- /bin/sh
kubectl logs -f  frontend-97cf8bf44-gp2cb 


minikube service mongodb 

kubectl get services mongodb
kubectl get services frontend


(kubectl port-forward service/mongodb 27017:27017)


/bin/sh /usr/share/nginx/env.sh
ls /bin/sh /usr/share/nginx/html/static/js