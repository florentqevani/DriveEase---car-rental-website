FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ .
COPY db/ ./db/
RUN mkdir -p uploads
COPY server/seed-images/ uploads/
EXPOSE 4000
CMD ["node", "src/index.js"]
