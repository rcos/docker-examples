# Simple Docker Compose

In this example, we will create a `docker-compose.yml` file to orchestrate our containers to make running our application easy.

# Running the application manually

(involves running of several containers)

# Writing a docker compose file

Our docker compose file will orchestrate our three services: our python app, PostgreSQL, and Redis. Many common services are available pre-built, which we will take advantage of. The compose file should be YAML named `docker-compose.yml`.

## Docker compose setup

First we will create the section for our python app.

Next we will use docker to 

Adding Postgres and Redis to the stack is trivial with compose is we use the pre-built official images.

###### Add PostgreSQL from official image
```
  postgres:
    image: postgres:9.5
```
This will add PostgreSQL version 9.5 from the corresponding official base image.

###### Expose the necessary ports
```
    expose: "5432"
```

The `expose` command exposes the port to other services within our docker-compose setup, but not the the host machine.

This is all we need for a basic postgres setup, but by default our data will only exist within the docker volume, and will therefore be destroyed if we destroy our docker setup. We should create a volume that maps to a local directory.

```
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
```

###### Add Redis from the official image
```
  redis:
    image: redis
```

###### Expose ports for Redis

```
    expose:
      - "6379"
```      
###### Create data volume for Redis

    volumes:
      - ./data/redis/:/var/lib/redis/data/
```

## Full docker-compose.yml

```
version: '2.0'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:9.5
    expose:
      - "5432"
    volumes:
      - ./data/postgres:/var/lib/postgresql/data

  redis:
    image: redis
    expose:
      - "6379"
    volumes:
      - ./data/redis/:/var/lib/redis/data/

```
