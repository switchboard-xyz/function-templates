# syntax=docker/dockerfile:1.4
FROM switchboardlabs/sgx-function AS builder

ARG CARGO_NAME=switchboard-function
ENV CARGO_NAME=$CARGO_NAME

WORKDIR /home/root/switchboard

COPY ./sgx-function/Cargo.toml ./sgx-function/Cargo.lock ./sgx-function/
COPY ./sgx-function/src ./sgx-function/src
WORKDIR /home/root/switchboard/sgx-function
RUN --mount=type=cache,target=/usr/local/cargo/registry,id=${TARGETPLATFORM} \
    --mount=type=cache,target=target,id=${TARGETPLATFORM} \
    cargo build --release && \
    cargo strip && \
    mv target/release/${CARGO_NAME} /sgx/app

FROM switchboardlabs/sgx-function

# Copy the binary
COPY --from=builder /sgx/app /sgx

# Get the measurement from the enclave
RUN rm -f /measurement.txt && \
    /get_measurement.sh && \
    cat /measurement.txt

ENTRYPOINT ["/bin/bash", "/boot.sh"]