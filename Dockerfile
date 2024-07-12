FROM node:18.20.2

LABEL maintainer="Lassemon"

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy workspace package.json files
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY packages/application/package.json packages/application/
COPY packages/common/package.json packages/common/
COPY packages/domain/package.json packages/domain/
COPY packages/infrastructure/package.json packages/infrastructure/

# Install dependencies at the root
RUN npm install

# Copy the rest of the application code, excluding node_modules
COPY . .

# Build the project
RUN npm run build

# Copy the entrypoint script
COPY entrypoint.sh /app/entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]