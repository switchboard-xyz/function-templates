.PHONY: build clean publish test

# Variables
CARGO_NAME=basic-oracle-function
DOCKER_IMAGE_NAME?=switchboard-labs/basic-oracle-function

DOCKER_BUILD_COMMAND=DOCKER_BUILDKIT=1 docker buildx build --platform linux/amd64 --build-arg CARGO_NAME=${CARGO_NAME} --build-arg SWITCHBOARD_RECEIVER_ADDRESS=${SWITCHBOARD_RECEIVER_ADDRESS}

# Default make task
all: build

docker_build:
	${DOCKER_BUILD_COMMAND} --pull -f Dockerfile -t ${DOCKER_IMAGE_NAME}:dev --load ./
docker_publish:
	${DOCKER_BUILD_COMMAND} --pull -f Dockerfile -t ${DOCKER_IMAGE_NAME} --push ./

build: docker_build measurement

publish: docker_publish measurement

measurement:
	@docker run -d --platform=linux/amd64 --name=my-switchboard-function ${DOCKER_IMAGE_NAME}:dev > /dev/null
	@docker cp my-switchboard-function:/measurement.txt measurement.txt
	@docker stop my-switchboard-function > /dev/null
	@docker rm my-switchboard-function > /dev/null

# Task to clean up the compiled rust application
clean:
	cargo clean
