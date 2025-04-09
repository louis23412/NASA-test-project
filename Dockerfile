# We can write all our instructionns in here to setup the docker container

# Docker will create a new layer each time we run a command
# Each of these commands will save the state of the image after that command in run

# Docker layers caching refers to the process where Docker saves individual layers of the Docker images you build so that they can be reused in subsequent pipeline runs,
# significantly speeding up the build process.

# ----

# LAYER 1
FROM node:lts-alpine
# Alpine is one of the most popular base images in docker, because of it small size
# node:lts will always use the latest version of node

# ----

# LAYER 2
WORKDIR /app
# This is the name of the folder where our files will live - we can name this anything we want

# ----

# LAYER 3
COPY package.json ./
# Here we copy the package.json file from the project folder to the /app (work directory) folder

# ----

# LAYERS 4 + 5
COPY client/package.json client/
RUN npm run install-client --omit=dev
# By using the --omit=dev flag, any dev dependencies will not be installed

# ----

# LAYERS 6 + 7
COPY server/package.json server/
RUN npm run install-server --omit=dev

# ----

# LAYERS 8 + 9
COPY client/ client/
RUN npm run build --prefix client

# ----

# LAYER 10
COPY server/ server/

# ----

USER node
# By default docker will run the commands as the root user, so we can specify to use the node user that the base image contain

CMD [ "npm", "start", "--prefix", "server" ]
# When our docker image is built and we want to start a docker container using this image, it will run the command specified in the array

EXPOSE 8000
# We need to expose this port so it is accessible outside of the container