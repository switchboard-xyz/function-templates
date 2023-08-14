.PHONY: build clean publish test

# Variables
CARGO_NAME=switchboard-function # Cargo.toml name
DOCKER_IMAGE_NAME=switchboardlabs/my-function # Docker registry image name

DOCKER_BUILD_COMMAND=DOCKER_BUILDKIT=1 docker buildx build --platform linux/amd64 --build-arg CARGO_NAME=${CARGO_NAME}

# Default make task
all: build

docker_build: 
	${DOCKER_BUILD_COMMAND} --pull -f Dockerfile -t ${DOCKER_IMAGE_NAME} --load ./
docker_publish: 
	${DOCKER_BUILD_COMMAND} --pull -f Dockerfile -t ${DOCKER_IMAGE_NAME} --push ./

build: docker_build measurement

publish: docker_publish measurement

measurement:
	@docker run -d --platform=linux/amd64 --pull always -q --name=my-switchboard-function ${DOCKER_IMAGE_NAME}:latest > /dev/null
	@docker cp my-switchboard-function:/measurement.txt measurement.txt
	@docker stop my-switchboard-function > /dev/null
	@docker rm my-switchboard-function > /dev/null
	@echo MrEnclave: $(shell cat ./measurement.txt)

# Task to clean up the compiled rust application
clean:
	cargo clean
