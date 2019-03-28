# Docker in Large Projects

In this exercise, we will be running a large open source project using docker.

## RocketChat

[RocketChat](https://rocket.chat/) is a popular open source webchat platform.
> Rocket.Chat is a Web Chat Server, developed in JavaScript, using the Meteor fullstack framework.  
It is a great solution for communities and companies wanting to privately host their own chat service or for developers looking forward to build and evolve their own chat platforms.

### Running RocketChat
[RocketChat Docker Official Image](https://github.com/RocketChat/Docker.Official.Image) is the source of this exercise.

RocketChat needs a database, so we are going to first start an instance of mongo:  
`docker run --name db -d mongo:3.2 mongod --smallfiles`  
This command runs the mongo image and executes mongod with the '--smallfiles' flag.  
The `--name` flag names the container 'db'.  
The `-d` flag runs the application in the background.  


Next, we are going to start the Rocket.Chat application linked to this mongo instance:  
`docker run --name rocketchat -p 3000:3000 --env ROOT_URL=http://localhost --link db:db -d rocket.chat`  
The `-p` flag publishes the container's port to the host's.  
The `--env` flag adds and environment variable to the container.     
The `--link` flag adds a link to another container   
>Links allow containers to discover each other and securely transfer information about one container to another container. The recipient can then access select data about the source.

Now, your application is running and you can view rocketchat at localhost:3000  

To see the running containers in docker, run `docker ps`    
To stop the container, run `docker stop <container-name>`  
To remove the container, run `docker rm <container-name>`

To see images in docker, run `docker images`  
To remove image, run `docker rmi <images-id>`  
