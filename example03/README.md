# Python Hello World Server with a Dockerfile

Docker images are the backbone of docker. Applications packaged into images can easily and portably be run anywhere where docker is available. In this example, we'll walk through the creation of a simple "Hello World" python server using a Dockerfile.

## Dockerfile
#### Create the Dockerfile
```
touch Dockerfile
```

#### Dockerfile Contents

###### Choose a base image for your container
Lets choose python:3.5 as our base image.  
```
FROM python:3.5
```
Docker runs instructions in a Dockerfile in order. The first instruction must be `FROM` in order to specify the Base Image from which you are building.

###### Make sure that the container is up to date
```
RUN apt-get update
```
RUN has 2 forms:

* `RUN <command>` (shell form, the command is run in a shell, which by default is /bin/sh -c on Linux or cmd /S /C on Windows)  
* `RUN ["executable", "param1", "param2"]` (exec form)  

The `RUN` instruction will execute any commands in a new layer on top of the current image and commit the results. The resulting committed image will be used for the next step in the Dockerfile.

###### Lets install python packages
```
RUN pip install Flask
```

###### Lets add the 'hello.py' file from our system to the container
```
ADD . /opt/webapp/
```
`ADD` has two forms:
* `ADD <src>... <dest>`  
* `ADD ["<src>",... "<dest>"]` (this form is required for paths containing whitespace)  

The ADD instruction copies new files, directories or remote file URLs from <src> and adds them to the filesystem of the container at the path <dest>.

###### Lets add an environment variable to the container
```
ENV FLASK_APP=hello.py
```
The `ENV` instruction sets the environment variable `<key>` to the value `<value>`.
This value will be in the environment of all “descendant” Dockerfile commands and can be replaced inline in many as well.

###### Set the working directory for our container
```
WORKDIR /opt/webapp
```
The `WORKDIR` instruction sets the working directory for any `RUN`, `CMD`, `ENTRYPOINT`, `COPY` and `ADD` instructions that follow it in the Dockerfile.

###### Lets expose the port on the docker container to our system
```
EXPOSE 5000
```
The `EXPOSE` instruction informs Docker that the container listens on the specified network ports at runtime. `EXPOSE` does not make the ports of the container accessible to the host. To do that, you must use either the `-p` flag to publish a range of ports or the `-P` flag to publish all of the exposed ports. You can expose one port number and publish it externally under another number.

###### Finally, we can run the application withing the container
```
CMD ["flask", "run", "--host=0.0.0.0"]
```
The `CMD` instruction has three forms:  
* `CMD ["executable","param1","param2"]` (exec form, this is the preferred form)
* `CMD ["param1","param2"]` (as default parameters to ENTRYPOINT)
* `CMD command param1 param2` (shell form)

There can only be one `CMD` instruction in a Dockerfile. If you list more than one `CMD` then only the last `CMD` will take effect.

The main purpose of a `CMD` is to provide defaults for an executing container. These defaults can include an executable, or they can omit the executable, in which case you must specify an `ENTRYPOINT` instruction as well.

### Full dockerfile

```bash
# Comments in Dockerfiles
FROM python:3.5

# Update and install dependencies
RUN apt-get update
RUN pip install Flask

# Add code
ADD . /opt/webapp/

# Set the working directory
WORKDIR /opt/webapp

# Set environment variables
ENV FLASK_APP=hello.py

# Expose the application's port
EXPOSE 5000

# Run the application
CMD ["flask", "run", "--host=0.0.0.0"]
```

## Build and run the Dockerfile

###### Build the Dockerfile with the build command
```
docker build -t <container-name> .
```

###### Run the container with the run command and open the port for the web server
```
docker run -p 5000:5000 <container-name>
```

## See the web Server
###### Visit localhost:5000 in your web browser so see the hello world example in action!
