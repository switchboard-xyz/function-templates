FROM gramineproject/gramine:v1.4

ENV PATH=$PATH:/root/.cargo/bin/
ENV DEBIAN_FRONTEND="noninteractive"
ENV DISTRO="ubuntu20.04-server"
ENV SGX_DRIVER_VERSION="2.11.54c9c4c"
ENV SGX_SDK_VERSION="2.19.100.3"
ENV SGX_SDK_VERSION_SHORT="2.19"
ENV UNAME="5.15.0-1035-azure"

RUN mkdir -p /data/protected_files && mkdir /sgx

# Add startup files, user can overwrite these
COPY --chown=root:root ./configs/boot.sh /boot.sh
COPY --chown=root:root ./configs/app.manifest.template /app.manifest.template
COPY --chown=root:root ./configs/get_measurement.sh /get_measurement.sh
RUN chmod a+x /boot.sh && chmod a+x /get_measurement.sh

# Add Azure DCAP registry
RUN curl -fsSLo /usr/share/keyrings/microsoft.asc https://packages.microsoft.com/keys/microsoft.asc && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.asc] https://packages.microsoft.com/ubuntu/20.04/prod focal main" | \
    tee /etc/apt/sources.list.d/msprod.list
# Add Intel SGX registry
RUN curl -fsSLo /usr/share/keyrings/intel-sgx-deb.asc https://download.01.org/intel-sgx/sgx_repo/ubuntu/intel-sgx-deb.key && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/intel-sgx-deb.asc] https://download.01.org/intel-sgx/sgx_repo/ubuntu focal main" | tee /etc/apt/sources.list.d/intel-sgx.list

# install Azure DCAP library
RUN --mount=target=/var/lib/apt/lists,type=cache,sharing=locked \
    --mount=target=/var/cache/apt,type=cache,sharing=locked \
    rm -f /etc/apt/apt.conf.d/docker-clean && \
    apt-get update && \
    apt-get -y --no-install-recommends install \
    wget \
    az-dcap-client \
    xxd \
    build-essential \
    gcc \
    clang \
    pkg-config \
    libssl-dev \
    libcurl4-openssl-dev \
    openssl \
    libssl-dev

# Install deps
RUN apt-get update
RUN apt-get upgrade -y
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y \
    git \ 
    nodejs 

# Setup PNPM
RUN npm i -g pnpm

# Setup Application
WORKDIR /root/app
COPY ./* ./
COPY ./src/ ./src/
RUN rm -rf node_modules/
RUN mkdir -p /root/app/dist/
RUN pnpm install
RUN pnpm build

WORKDIR /root/app
COPY configs/boot.sh /boot.sh
COPY configs/app.manifest.template app.manifest.template
COPY configs/pccs.json /opt/intel/sgx-dcap-pccs/config/default.json
COPY configs/sgx_default_qcnl.conf /etc/sgx_default_qcnl.conf

# =--------------------------------------------------------------------------------------------------------------=
# LOCAL FROM HERE

ARG SWITCHBOARD_RECEIVER_ADDRESS
ENV SWITCHBOARD_RECEIVER_ADDRESS=$SWITCHBOARD_RECEIVER_ADDRESS

# Copy the binary
WORKDIR /sgx
COPY ./configs/app.manifest.template /sgx/app.manifest.template

# Get the measurement from the enclave
RUN /get_measurement.sh

ENTRYPOINT ["bash", "/boot.sh"]
