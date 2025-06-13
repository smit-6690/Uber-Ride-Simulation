# Base image
FROM node:18

# App directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Expose customer port
EXPOSE 4003

# Run app
CMD ["node", "app.js"]
