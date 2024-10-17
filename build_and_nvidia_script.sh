apptainer build --sandbox tunneller-support-latest.sif docker://benndrucker/tunneller-support:latest &&
    cd tunneller-support-latest.sif &&
    cp /usr/bin/nvidia-smi ./usr/bin/ &&
    cp /usr/bin/nvidia-debugdump ./usr/bin/ &&
    cp /usr/bin/nvidia-cuda-mps-control ./usr/bin/ &&
    cp /usr/bin/nvidia-cuda-mps-server ./usr/bin/