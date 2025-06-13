# Step 1: Build the app
FROM node:18 AS builder
WORKDIR /app

# Clean install inside container
COPY package*.json ./
RUN npm install

# Then copy the rest AFTER install
COPY . .

# Ensure node_modules and lock file are ARM compatible
RUN rm -rf node_modules package-lock.json && npm install && npm run build

# Step 2: Serve using nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]



