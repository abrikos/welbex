FROM node:16-alpine as builder
WORKDIR /app
COPY package.json /app/package.json
RUN npm install --only=prod
COPY public /app/public
COPY backend /app/backend
COPY src /app/src
#RUN npm run build
RUN npm run backend
RUN ls -l

FROM nginx:1.16.0-alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/dist /app
COPY package.json /app/package.json
RUN apk --no-cache add --virtual builds-deps build-base python
RUN npm install --only=prod
EXPOSE 8080
USER node
CMD ["node", "backend/server.js"]