FROM node

WORKDIR /workdir
COPY "." "/workdir"

RUN npm install
RUN npm run build

FROM nginx

COPY --from=0 /workdir/build /usr/share/nginx/html
