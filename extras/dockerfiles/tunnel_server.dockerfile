# Get latest Ubuntu version
FROM ubuntu:latest

# Install basic utilities
RUN apt-get update && apt-get install -y sudo bash

# Create user "tunneller"
ARG UN=tunneller
RUN useradd -ms /bin/bash $UN
WORKDIR /home/$UN

# Install VS Code
COPY vscode_script.sh /home/$UN/install_script.sh
RUN chmod +x /home/$UN/install_script.sh && /home/$UN/install_script.sh

# docker buildx build \
#    --platform linux/arm64,linux/amd64 \
#    -f tunnel_server.dockerfile \
#    -t benndrucker/vscode-tunneller:latest \
#    -t benndrucker/vscode-tunneller:0.1.0 \
#    --push .