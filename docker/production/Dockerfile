FROM chartjs-node-canvas-base

LABEL maintainer = "sean.m.sobey@gmail.com"

WORKDIR /usr/app

COPY --from=chartjs-node-canvas-build /usr/app/dist/ ./dist/

CMD ["/bin/bash", "-c", "echo production image complete"]