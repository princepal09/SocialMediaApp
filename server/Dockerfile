# Use Node.js 20 with Alpine Linux
# Alpine is a lightweight version, so the Docker image is smaller
FROM node:22-alpine


# Set the working directory inside the container
# All following commands will run inside /app
WORKDIR /app


# Copy package.json and package-lock.json
# We copy these first to take advantage of Docker layer caching
COPY package*.json ./


# Install project dependencies
# npm ci is recommended for Docker/production because it installs
# exactly the versions from package-lock.json
RUN npm ci


# Copy the rest of the application source code
# The first "." is the current project folder
# The second "." is the /app folder inside the container
COPY . .


# Build the TypeScript/backend application
# For example: TypeScript source files → JavaScript files in /dist
RUN npm run build


# Document that the application inside the container uses port 6001
# Your Express server should listen on port 6001
EXPOSE 6001


# Start the compiled backend application
# Runs: node dist/index.js
CMD ["npm", "run", "dev"]