# Use an official Node.js image as the base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if you have it) to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code to the container
COPY . .

# Expose the port your application runs on (e.g., 3000 for Next.js apps)
EXPOSE 3000 

# Set the command to run the application in development mode
CMD ["npm", "run", "dev"]