FROM node:18-alpine AS build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY public/ ./public/

COPY src/ ./src/

ENV REACT_APP_PRODUCT_API=$REACT_APP_PRODUCT_API
ENV REACT_APP_ORDER_API=$REACT_APP_ORDER_API

RUN npm run build

FROM nginx:alpine AS production

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]