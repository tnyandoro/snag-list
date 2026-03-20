FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port - IMPORTANT for Docker networking
EXPOSE 3000

# Run with ts-node for development (no build step)
CMD ["npx", "ts-node", "src/index.ts"]
