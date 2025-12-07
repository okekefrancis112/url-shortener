# # Use a lightweight Node.js base image
# FROM node:18-alpine

# # Set the working directory
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install production dependencies
# RUN npm ci --only=production

# # Copy the rest of the application code and the .env file
# COPY . .

# # Remove development dependencies and other unnecessary files
# RUN npm prune --production && \
#     rm -rf node_modules/.cache && \
#     rm -rf .npm && \
#     rm -rf package*.json

# # Expose the port your application listens on
# EXPOSE 8080

# # Set environment variables from .env file
# ENV NODE_ENV=production

# # Start the application
# CMD ["node", "server.js"]

# Use a lightweight Node.js base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the application source code
COPY . .

# Expose the port Railway will use
EXPOSE 8080

# Set environment for production
ENV NODE_ENV=production

# Start server
CMD ["node", "server.js"]
