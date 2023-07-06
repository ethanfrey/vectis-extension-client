## Docker

.PHONY: build
build:
	docker build . -t pulsar/vectis-todo:latest

.PHONY: run
run:
	docker run -p 0.0.0.0:8000:8000 -it pulsar/vectis-todo:latest

