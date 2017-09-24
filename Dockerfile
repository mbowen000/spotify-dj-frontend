FROM node:6
WORKDIR /usr/app
# this fixes bower failing because it doesnt like the git submodule
ENV GIT_DIR=/tmp 
COPY . .
RUN npm install --silent --progress=false
RUN npm install -g nodemon --silent --progress=false
RUN ./node_modules/bower/bin/bower install --production --silent --config.interactive=false
# CMD ['nodemon', '-L', 'app.js']