# Use official Node.js LTS image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the app files
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Run the app
CMD ["node", "app.js"]
