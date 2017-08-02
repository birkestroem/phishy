FROM debian as builder
WORKDIR /p0f-mtu
COPY p0f-mtu .

RUN apt-get update
RUN apt-get install -y build-essential libpcap-dev; 
RUN ./build.sh
RUN cd ./tools; make


FROM node:latest
COPY --from=builder /p0f-mtu/p0f /usr/local/sbin
COPY --from=builder /p0f-mtu/p0f.fp /etc/p0f
COPY --from=builder /p0f-mtu/tools/p0f-client /usr/local/bin

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
