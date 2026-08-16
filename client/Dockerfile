FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Vite development port
EXPOSE 3001

# Start Vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]