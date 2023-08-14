# syntax=docker/dockerfile:1.4
FROM switchboardlabs/sgx-function AS builder

# Setup Dependencies
WORKDIR /app
COPY package.json ./package.json
RUN npm install

# Build Function
COPY esbuild.js tsconfig.json ./
COPY ./src ./src
RUN npm run build:function

FROM switchboardlabs/sgx-function

ARG SWITCHBOARD_RECEIVER_ADDRESS
ENV SWITCHBOARD_RECEIVER_ADDRESS=$SWITCHBOARD_RECEIVER_ADDRESS

# Copy the compiled JS file
COPY --from=builder /app/dist/index.js /sgx/nodejs/index.js

# Get the measurement from the enclave
RUN rm -f /measurement.txt && \
    /get_measurement.sh && \
    cat /measurement.txt

ENTRYPOINT ["bash", "/boot.sh", "--nodejs"]
