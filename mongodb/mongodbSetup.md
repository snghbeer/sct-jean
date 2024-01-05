Start container with volume to persist data on the local machine
every minute:

* * * * *

every day at 2 AM
0 2 * * *


step 1 - build custom mongodb image:
docker buildx build -t mongodb_ehb .

Optional step (cleanup)
sudo rm -r ~/mongo-data

step 2 - start container with volume mapping:
docker run -d -p 27017:27017 --name mongodb_ehb -v ~/mongo-data/dump:/data/db/dump mongodb_ehb 

docker volume create dt_management
docker run -d -p 27017:27017 --name mongodb_ehb -v dt_management:/data/db/dump mongodb_ehb 


Connect to db:
mongosh --username nivonj --password Student1 --authenticationDatabase data_management

Test insert:
use data_management;

  db.posts.insertOne({
    title: "hELL oWorld",
    content: "This world is kind of hell",
  })

Manual restore:
mongorestore -u adminUser -p StudentAdmin1EHB --db data_management --drop --preserveUUID /data/db/dump/data_management


Persistence test:

- add sales.json in MongoDBCompass
- wait for dump
- remove container
- run container
