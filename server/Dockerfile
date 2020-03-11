FROM node:8

# Create working app directory
WORKDIR /usr/src/app

# Copy Package for npm install
COPY package*.json ./

RUN npm install
RUN npm audit fix

COPY . .

# Environment Variables
#ENV NODE_ENV=
#ENV PROTOCOL=
ENV PORT=17117
#ENV HOSTNAME=
#ENV EXTENSTION=
#ENV TOKENKEY=
#ENV TOKENEXPIRETIME=
#ENV TOKENISSUER=
#ENV MONGO_URL=
#ENV MONGO_PORT=
#ENV MONGO_OPTIONS=
#ENV MONGO_USER=
#ENV MONGO_PASS=

RUN npm build

EXPOSE ${PORT}

CMD [ "npm", "start" ]