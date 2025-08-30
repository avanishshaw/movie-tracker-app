# I chose a lightweight Node.js image (alpine version) to keep the final image small and efficient
FROM node:18-alpine

# Set the working directory inside the container to /app
# This ensures all subsequent commands run in this directory
WORKDIR /app

# First, I’m copying only package.json and package-lock.json
# This allows Docker to cache npm install layer, so dependencies don’t reinstall every time unless these files change
COPY package*.json ./

# Install project dependencies inside the container
RUN npm install

# Now I copy the rest of the application code
# This separation ensures better use of Docker's layer caching
COPY . .

# Expose port 5001 so that my application inside the container 
# can be accessed from outside on this port
EXPOSE 5001

# Finally, I define the default command to start my Node.js application
# Here I’m using "npm start" which runs whatever is defined under "start" in package.json
CMD ["npm", "start"]
