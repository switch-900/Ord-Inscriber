FROM node:18.20.4-alpine3.20

# Install required packages and security updates
RUN apk add --no-cache curl && \
    apk upgrade --no-cache

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Create non-root user
RUN addgroup -g 1000 ordinals && adduser -D -s /bin/sh -u 1000 -G ordinals ordinals
RUN chown -R ordinals:ordinals /app

USER ordinals
EXPOSE 3333

CMD ["node", "server.js"]
