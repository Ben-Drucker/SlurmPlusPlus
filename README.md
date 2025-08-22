# Welcome to SLURM++ [Public Version] !

## Installation (of dev container on HPC cluster):

### Prerequisites:

- `apptainer` on HPC cluster
- VS Code (most recent version)

### Steps:
- Login to (SSH into) HPC "login" node.
- Load `apptainer` — typically by running `module load apptainer`.
- Run `source <(curl -s "https://raw.githubusercontent.com/Ben-Drucker/slurm-gen-internal/refs/heads/main/build_and_nvidia_script.sh?token=GHSAT0AAAAAACTQF4TQOQRUCC5WY5RJVG6IZYRQF6A")`. This will do the following **automatically**:
  - Download `tunneller-support` container
  - Build the container to a `.sif` file
  - Install Nvidia drivers (See troubleshooting section if Nvidia drivers not found)


## Troubleshooting:

- Before continuing, ensure your version of VS Code is up to date.

|Problem|Solution|
|-------|---------|
|SSH won't connect | • You may need to connect to a VPN and/or HTTPS proxy if your institution requires it <br> • An `id_rsa` ssh key is required (currently) for authentication. Ensure it is located in ~/.ssh. <br> • Ensure your computer has an ssh client installed.|
|`apptainer` not found| • If you get this message (or something like it) you may need to modify the default command string in SLURM++ (I.e., if `apptainer` is located at a different path on your HPC cluster).|
| Job seems to quit instantly | • The container could not be run and the job exited. Check output log for the reason why.|
|CUDA support not working| • During installation, if the Nvidia drivers were not found, they need to be installed manually using a command like `cp <path to drivers on host> <container.sif>/<driver paths>`.
|Other issues| • This extension has not been tested on different HPC clusters with potentially different settings. If `stderr` differs, for example, when `srun` is called, the extension will not work.