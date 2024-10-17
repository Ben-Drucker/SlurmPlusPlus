# Welcome to SLURM++!

## Installation:

### Prerequisites:

- `apptainer` loaded — typically by running `module load apptainer`.
- VS Code (most recent version)

### Steps:
- Login to HPC "login" node
- Run `source <(curl -s "https://drive.usercontent.google.com/download? id=1lm1KxIDH8N6_ZWAoAi73X3c0qok26Fl1&export=download&authuser=0&confirm=t&uuid=7f060853-e557-49ba-ae75-fd10bd9278fa&at=AN_67v1lGKT2Thw- qDKOifm5D5k3:1729199811993")`. This will do the following:
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