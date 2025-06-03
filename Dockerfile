FROM node:18.20.4-alpine3.20

# Install required packages and ord binary
RUN apk add --no-cache curl && \
    apk upgrade --no-cache && \
    # Download and install ord binary
    curl -L https://github.com/ordinals/ord/releases/download/0.19.1/ord-0.19.1-x86_64-unknown-linux-musl.tar.gz \
    | tar -xz -C /tmp && \
    mv /tmp/ord /usr/local/bin/ord && \
    chmod +x /usr/local/bin/ord

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
