# syntax=docker/dockerfile:1.4
FROM switchboardlabs/sgx-function AS builder

ARG CARGO_NAME=switchboard-function-evm
ENV CARGO_NAME=$CARGO_NAME
ARG SWITCHBOARD_RECEIVER_ADDRESS
ENV SWITCHBOARD_RECEIVER_ADDRESS=$SWITCHBOARD_RECEIVER_ADDRESS

WORKDIR /home/root/switchboard-function/sgx-function
COPY ./Cargo.toml  ./
COPY ./build.rs  ./
COPY ./src ./src

RUN rustup update

RUN rustup override set stable
RUN --mount=type=cache,target=/usr/local/cargo/registry,id=${TARGETPLATFORM} \
    --mount=type=cache,target=target,id=${TARGETPLATFORM} \
    cargo build --release && \
    cargo strip && \
    mv target/release/${CARGO_NAME} /sgx/app

FROM switchboardlabs/sgx-function

# Copy the binary
WORKDIR /sgx
COPY --from=builder /sgx/app /sgx

# Get the measurement from the enclave
RUN rm -f /measurement.txt && \
    /get_measurement.sh && \
    cat /measurement.txt

ENTRYPOINT ["bash", "/boot.sh"]
