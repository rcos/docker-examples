# Simple Docker Compose

In this example, we will create a `docker-compose.yml` file to orchestrate our containers to make running our application easy.

This example is partially derived from a Docker Labs example,
[https://github.com/docker/labs/tree/master/developer-tools/nodejs/porting/](https://github.com/docker/labs/tree/master/developer-tools/nodejs/porting/)

* We will use 2 images to package the application
  * one image for the database
  * one image for the application
* All needed code other than the `Dockerfile` and the `docker-compose.yml` file can be found in the `messageApp` directory.

## The application

* There are several possibilities to create the image
  * extend an official Linux distribution image (Ubuntu, CentOS, ...) and install Node.js runtime
  * use the official Node.js image (https://store.docker.com/images/node)

We'll go for the second option as it offers an optimized image.

## Database

* Usage of the official [MongoDB image](https://store.docker.com/images/mongo)

# Start by setting up a Node.js container

## Dockerfile

We'll use the following Dockerfile to build our application's image:

```
# Use node 10.15.3 LTS
FROM node:10.15.3
ENV LAST_UPDATED 20190325T175400

# Copy source code
COPY . /app

# Change working directory
WORKDIR /app

# Install dependencies
RUN npm install

# Fix up some of the issues
RUN npm audit fix

# Expose API port to the outside
EXPOSE 1337

# Launch application
CMD ["node","app.js"]
```
First define the base image as a version of node.

```
# Use node 10.15.3 LTS
FROM node:10.15.3
ENV LAST_UPDATED 20190325T175400
```
Copy everything from the current directory to the ***/app*** directory in the container and make that directory the working directory

```
# Copy source code
COPY . /app

# Change working directory
WORKDIR /app
```
Get your node dependecies installed and fixed up.

```
# Install dependencies
RUN npm install

# Fix up some of the issues
RUN npm audit fix
```
Set up the communications port.

```
# Expose API port to the outside
EXPOSE 1337
```

And launch the node server

```
# Launch application
CMD ["node","app.js"]

```

## Image creation

* Create the **Dockerfile** in your current directory

* Create the docker image using ```docker build -t message-app .```

* List all images available on the Docker host ```docker images```

## Now run it ...

```
$ docker run message-app
npm info it worked if it ends with ok
...
error: A hook (`orm`) failed to load!
error: Error: Failed to connect to MongoDB.  Are you sure your configured Mongo instance is running?
 Error details:
{ [MongoError: connect ECONNREFUSED 127.0.0.1:27017]
  name: 'MongoError',
  message: 'connect ECONNREFUSED 127.0.0.1:27017' }]
  originalError:
   { [MongoError: connect ECONNREFUSED 127.0.0.1:27017]
     name: 'MongoError',
     message: 'connect ECONNREFUSED 127.0.0.1:27017' } }
```

**The application cannot connect to a database as we did not provide external db information nor container running mongodb**


# Writing a docker compose file

We can fix this by using a docker compose file to launch both of our services at the same time. The compose file should be YAML named `docker-compose.yml` and you can create it in the `messageApp` directory alongside the `Dockerfile` we used to create the node app.

Overall, the `docker-compose.yml` should be

```
version: '3'
services:
  mongo:
    image: mongo:4.0.7
    volumes:
      - mongo-data:/data/db
    expose:
      - "27017"
  app:
    build: .
    ports:
            - "1337:1337"
    links:
      - mongo
    depends_on:
      - mongo
    environment:
      - MONGO_URL=mongodb://mongo/messageApp
volumes:
  mongo-data:
```

Define the file as a version 3 YAML, and specify `mongodb` from one of the base images. Use the `mongo-data` volume as persistent storage and expose port `27017` for use among the services in this file.

```
version: '3'
services:
  mongo:
    image: mongo:4.0.7
    volumes:
      - mongo-data:/data/db
    expose:
      - "27017"
```

Define our application as an image that needs to be built in the current directory, expose port `1337` for external communication, make it link to and depend on `mongo` and set an evironment variable so it knows how to communicate with the database.

```
  app:
    build: .
    ports:
            - "1337:1337"
    links:
      - mongo
    depends_on:
      - mongo
    environment:
      - MONGO_URL=mongodb://mongo/messageApp
```

Finally, set up a named volume for persistent storage.

```
volumes:
  mongo-data:
```

# Running Docker Compose
From within the directory containing our `docker-compose.yml`:

###### Build docker-compose
```
docker-compose build
```

###### Run the services
```
docker-compose up
```

## Using the app

Now in another terminal, try:

* Get current list of messages
  * ```curl http://localhost:1337/message```

```
[]
```

* Create new messages
  * ```curl -XPOST http://localhost:1337/message?text=hello```
  * ```curl -XPOST http://localhost:1337/message?text=hola```
  
* Get list of messages
  * ```curl http://localhost:1337/message```

```
[
  {
    "text": "hello",
    "createdAt": "2015-11-08T13:15:15.363Z",
    "updatedAt": "2015-11-08T13:15:15.363Z",
    "id": "5638b363c5cd0825511690bd" 
  },
  {
    "text": "hola",
    "createdAt": "2015-11-08T13:15:45.774Z",
    "updatedAt": "2015-11-08T13:15:45.774Z",
    "id": "5638b381c5cd0825511690be"
  }
]
```
* Modify a message
  * ```curl -XPUT http://localhost:1337/message/5638b363c5cd0825511690bd?text=hey```

* Delete a message
  * ```curl -XDELETE http://localhost:1337/message/5638b381c5cd0825511690be```

* Get list of messages
  * ```curl http://localhost:1337/message```

```
[
  {
    "text": "hey",
    "createdAt": "2015-11-08T13:15:15.363Z",
    "updatedAt": "2015-11-08T13:19:40.179Z",
    "id": "5638b363c5cd0825511690bd"
  }
]
```
Make sure your `XPUT`s and `XDELETE`s use valid IDs instead of the ones in the example.
