db = db.getSiblingDB("data_management");
db.createUser({
    user: "adminUser",
    pwd: "StudentAdmin1EHB",
    roles: [
        {
            role: "root",
            db: "admin"
        }
    ]
});

db.createUser({
  user: "nivonj",
  pwd: "Student1",
  roles: [
      {
          role: "readWrite",
          db: "data_management"
      }
  ]
});

// Create a posts collection
db.createCollection("posts", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["title", "content"],
        properties: {
          title: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          content: {
            bsonType: "string",
            description: "must be a string and is required",
          },
        },
      },
    },
  })
  

// Add an index for the title field in the posts collection for query optimization
db.posts.createIndex({ title: 1 });


db.posts.insertOne({
    title: "Sample Title",
    content: "Sample Content lorem ipsum",
  })
  
  db.posts.insertOne({
    title: "Lorep ipsum",
    content: "Sample Content lorem ipsum 2",
  })

  db.posts.insertOne({
    title: "Sushimi Upsem",
    content: "Sample Content lorem ipsum 3",
  })