# Use lightweight Node.js 24 Alpine image for a smaller and secure container size
FROM node:22-alpine

# Set the working directory inside the container where all commands will execute
WORKDIR /app

# Copy dependency manifests first to leverage Docker's layer caching
COPY package*.json ./

# Install dependencies cleanly using package-lock.json
RUN npm ci

# Copy the rest of the application source code into the container
COPY . .

# Build the TypeScript source code into compiled JavaScript (outputs to /dist)
RUN npm run build

# Expose port 6001 to document that the container listens on this port
EXPOSE 6001

# Start the compiled backend application server
CMD ["node", "dist/index.js"]