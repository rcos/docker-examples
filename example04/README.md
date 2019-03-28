# Simple Docker Compose

In this example, we will create a `docker-compose.yml` file to orchestrate our containers to make running our application easy.

# Writing a docker compose file

Our docker compose file will orchestrate our four services: our python backend, an angular frontend, PostgreSQL, and Redis. This will make it very easy to build and link our containers, and add new volumes. As we saw before, many common services are available pre-built, which we will take advantage of. The compose file should be YAML named `docker-compose.yml`.

## Docker compose setup

Adding Postgres and Redis to the stack and linking them to our python application is very easy with compose.

##### Add PostgreSQL from official image
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

##### Add Redis from the official image
```
  redis:
    image: redis
```

###### Expose ports for Redis

```
    expose:
      - "6379"
```      
###### (Optional) Create data volume for Redis
```
    volumes:
      - ./data/redis/:/var/lib/redis/data/
```

##### Add our python backend to compose

Instead of using a hosted Docker image, we can tell docker compose to build from a local Dockerfile by using the `build` command.

###### Use the Dockerfile located in `backend/`

```
  backend:
    build: backend
```

###### Add depdendencies
```
    depends_on:
      - postgres
      - redis
```
`depends_on` links the containers, and also specifies that `postgres` and `redis` should be started whenever we run our `backend` service.

###### Expose ports
```
    ports:
      - "5000:5000"
```

The `ports` command exposes the specified port to the host machine.

###### Add volumes
To make development a little easier, we can map the directory containing the application code to a volume connected to our `backend` service.

```
    volumes:
      - ./backend:/usr/src/app
```

This effectively links the local directory to the directory within the container that contains the application code, allowing us to edit the code without having to rebuild.

##### Repeat for the Angular frontend

Instead of using a hosted Docker image, we can tell docker compose to build from a local Dockerfile by using the `build` command like we did before.

###### Use the Dockerfile located in `frontend/`

```
  frontend:
    build: frontend
```

###### Add dependencies
```
    depends_on:
      - backend
```
`depends_on` links the containers, and also specifies that `backend` should be started before the frontend is started.

###### Expose ports
```
    ports:
      - "4200:4200"
```

The `ports` command exposes the specified port to the host machine.

###### Add volumes
To make development a little easier, we can map the directory containing the application code to a volume connected to our `frontend` service.

```
    voumes:
      - ./frontend:/usr/src/app
```

## Full docker-compose.yml

```
version: '2.0'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/usr/src/app
  
  frontend:
    build: ./frontend
    ports:
      - "4200:4200"
    depends_on:
      - backend
    command: "ng serve --host 0.0.0.0 --disable-host-check"

  postgres:
    image: postgres:9.5
    expose:
      - "5432"

  redis:
    image: redis
    expose:
      - "6379"

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

In your web browser, visit `localhost:4200` to see the frontend!

To access the backend directly, visit `localhost:5000`.
