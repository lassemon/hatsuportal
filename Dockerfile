FROM node:18.20.2

LABEL maintainer="Lassemon"

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy workspace package.json files
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY boundedContext/mediaManagement/package.json boundedContext/mediaManagement/
COPY boundedContext/postManagement/package.json boundedContext/postManagement/
COPY boundedContext/userManagement/package.json boundedContext/userManagement/
COPY boundedContext/shared-kernel/package.json boundedContext/shared-kernel/
COPY packages/bounded-context-service-contracts/package.json packages/bounded-context-service-contracts/
COPY packages/contracts/package.json packages/contracts/
COPY packages/platform/package.json packages/platform/
COPY packages/common/package.json packages/common/

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