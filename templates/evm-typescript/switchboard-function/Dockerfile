# syntax=docker/dockerfile:1.4
FROM switchboardlabs/sgx-function AS builder

ARG SWITCHBOARD_RECEIVER_ADDRESS
ENV SWITCHBOARD_RECEIVER_ADDRESS=$SWITCHBOARD_RECEIVER_ADDRESS

# Setup PNPM
RUN npm i -g pnpm

# Setup Application
WORKDIR /app
COPY package.json ./package.json
RUN pnpm install
COPY esbuild.js tsconfig.json ./
COPY ./src ./src
RUN pnpm build

FROM switchboardlabs/sgx-function

# Copy SGX configs
COPY ./configs/app.manifest.template /sgx/app.manifest.template
COPY ./configs/boot.sh /boot.sh
RUN chmod +x ./boot.sh

RUN mkdir -p /sgx/app

# Copy the compiled JS file
COPY --from=builder /app/dist/index.js /sgx/app/index.js

# Get the measurement from the enclave
RUN rm -f /measurement.txt && \
    /get_measurement.sh && \
    cat /measurement.txt

ENTRYPOINT ["bash", "/boot.sh"]
