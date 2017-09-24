FROM node:6
WORKDIR /usr/app
COPY . .
RUN npm install --silent --progress=false
RUN ./node_modules/bower/bin/bower install --production --silent --config.interactive=false
CMD ['npm', 'start']