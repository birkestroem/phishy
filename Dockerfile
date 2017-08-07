# Build p0f
FROM node:latest
WORKDIR /p0f-mtu
COPY p0f-mtu .
RUN apt-get update
RUN apt-get install -y build-essential libpcap-dev; 
RUN CFLAGS="$CFLAGS -static" ./build.sh
RUN cd ./tools; make


# Build application
FROM node:latest
WORKDIR /usr/src/app

# Copy P0f to image
RUN mkdir -p /etc/p0f
RUN mkdir -p /var/run/p0f
COPY --from=0 /p0f-mtu/p0f.fp /etc/p0f/p0f.fp
COPY --from=0 /p0f-mtu/p0f /usr/local/sbin
COPY --from=0 /p0f-mtu/tools/p0f-client /usr/local/bin

# Node application
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]
