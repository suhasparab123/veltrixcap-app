# Dockerfile
FROM node:20-alpine AS base

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Expose app port
EXPOSE 3000

# Run app
CMD ["node", "app.js"]

