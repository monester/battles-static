FROM node AS build

WORKDIR /src
COPY public /src/public
COPY src /src/src
COPY package.json yarn.lock /src/

RUN yarn install

RUN yarn run build

FROM nginx

COPY default.conf /etc/nginx/conf.d
COPY --from=build /src/build /usr/share/nginx/html
