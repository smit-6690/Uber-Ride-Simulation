# Base image
FROM node:18

# App directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Expose driver port
EXPOSE 4002

# Run app
CMD ["node", "app.js"]
