# Setup
FROM benndrucker/tunneller-support:0.0.2

RUN add-apt-repository -y ppa:deadsnakes/ppa
RUN apt install -y python3.13-full
RUN python3.13 -m ensurepip --upgrade || true
RUN python3.13 -m pip install --root-user-action ignore matplotlib scipy pandas scikit-learn seaborn

RUN setcap -r /usr/lib/x86_64-linux-gnu/gstreamer1.0/gstreamer-1.0/gst-ptp-helper
CMD ["code", "tunnel"]

# docker buildx build \
#    --platform linux/arm64,linux/amd64 \
#    -f tunnel_python.dockerfile \
#    -t benndrucker/python-tunneller:latest \
#    -t benndrucker/python-tunneller:0.0.1 \
#    --push .