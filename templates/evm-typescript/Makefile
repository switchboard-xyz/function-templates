# include `.env` file and export its env vars
# (-include to ignore error if it does not exist)
-include .env

# Variables
DOCKER_IMAGE_NAME?=switchboard-labs/basic-oracle-function
DOCKER_BUILD_COMMAND=DOCKER_BUILDKIT=1 docker buildx build --platform linux/amd64 --build-arg SWITCHBOARD_RECEIVER_ADDRESS=${SWITCHBOARD_RECEIVER_ADDRESS}

# dependencies
update                :; forge update

# install proper solc version
solc                  :; nix-env -f https://github.com/dapphub/dapptools/archive/master.tar.gz -iA solc-static-versions.solc_0_8_19

# build & test
build-contracts       :; forge build
build-optimised       :; forge build --optimize
test-forge            :; forge test
test-gasreport 	      :; forge test --gas-report
trace                 :; forge test -vvv
clean                 :; forge clean
snapshot              :; forge snapshot

# chmod scripts
scripts               :; chmod +x ./scripts/*

# fork mainnet with Hardhat
mainnet-fork          :; npx hardhat node --fork ${ETH_MAINNET_RPC_URL}

# Default make task
all: build-contracts build-function

docker_build:
	${DOCKER_BUILD_COMMAND} --pull -f Dockerfile -t ${DOCKER_IMAGE_NAME}:latest --load ./
docker_publish:
	${DOCKER_BUILD_COMMAND} --pull -f Dockerfile -t ${DOCKER_IMAGE_NAME}:latest --push ./

build-function: docker_build measurement

publish-function: docker_publish measurement

measurement:
	@docker run -d --platform=linux/amd64 --pull always -q --name=my-switchboard-function ${DOCKER_IMAGE_NAME}:latest > /dev/null
	@docker cp my-switchboard-function:/measurement.txt measurement.txt
	@docker stop my-switchboard-function > /dev/null
	@docker rm my-switchboard-function > /dev/null
	@echo MrEnclave: $(shell cat ./measurement.txt)
