# Welcome to SLURM++!

## Background and Introduction

1. Several high performance computing (HPC) clusters (think, supercomputers) use [SLURM](https://slurm.schedmd.com/documentation.html), a suite of shell commands, to allow users to request computation resources in an equitable way.

2. Many developers also use [Visual Studio code](https://TODO.incude.link) (VS Code), a flexible, extensible integrated development environment (IDE) for programming in a variety of languages.

3. Another challenge for developers is using HPC resources for development itself (not just running precompiled programs). This is important, especially in a machine learning/deep learning setting — an engineer may want to experiment and prototype large models that can only be run on HPC hardware. Development can be difficult in environments without `sudo`/`root`/`admin` privileges; often, developers require specific compilers, versions of packages, and hardware monitoring software. HPCs typically do not allow users to install such items.

**This extension, `SLURM++`, for VS Code, aims to address these issues through the following solutions:**

- Adds a graphical user interface for requesting and starting SLURM jobs directly inside VS Code without having to login (SSH) into the cluster login node and manually submit a command:
![Screenshot of GUI interface in VS Code](extras/GUI_screenshot.png)
- Includes a docker container image system that can be run on HPC hardware through `apptainer`, a docker-like engine common on HPC systems. Developers can use this, along with the `--fake-root` option to simulate an environment with root privleges. (`.dockerfile` + link to cross-architecture, prebuilt image here: [https://TODO.include.link](https://TODO.include.link))

## Installation & typical usage workflow

1. Download and install VS Code (if not already completed): [download link here](https://code.visualstudio.com/download)
2. Install the `SLURM++` extension from the VS Code marketplace: [marketplace link here](https://TODO.include.link)
3. Open the `SLURM++` control panel in `User View Container: Focus on SLURM++ view`. The icon looks like this: <img src="spp-strokes.svg" alt="SLURM++ Icon" width="24" height="24">. If it is not visible, open the command palette (Cmd+Shift+P on Mac, Ctrl+Shift+P on Windows) and search for `SLURM++: Focus on SLURM++ view`. You can optionally secondary-click and choose to keep it in the activity bar for easy access.
4. Input all desired SLURM parameters (e.g., number of nodes, time limit, etc.) in the GUI.
5. Click "Preview Configuration" to see the generated SLURM script.
6. Click "Submit Job" to submit the job to the HPC cluster.
7. The `output` panel will display the node your job is running on, along with the job ID.
8. In the command palette, search for `Remote - SSH: Connect to Host...` and input the node address (e.g., `node123.cluster.edu`) to open a new VS Code window connected to the compute node. In a future release, this step will automatically open a new window for you.

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

| Problem                     | Solution                                                                                                                                                                                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SSH won't connect           | • You may need to connect to a VPN and/or HTTPS proxy if your institution requires it <br> • An `id_rsa` ssh key is required (currently) for authentication. Ensure it is located in ~/.ssh. <br> • Ensure your computer has an ssh client installed. |
| `apptainer` not found       | • If you get this message (or something like it) you may need to modify the default command string in SLURM++ (I.e., if `apptainer` is located at a different path on your HPC cluster).                                                              |
| Job seems to quit instantly | • The container could not be run and the job exited. Check output log for the reason why.                                                                                                                                                             |
| CUDA support not working    | • During installation, if the Nvidia drivers were not found, they need to be installed manually using a command like `cp <path to drivers on host> <container.sif>/<driver paths>`.                                                                   |
| Other issues                | • This extension has not been tested on different HPC clusters with potentially different settings. If `stderr` differs, for example, when `srun` is called, the extension will not work.                                                             |

### To rebuild this extension:
Run the shell commands:
- `npm install`
- `npm install -g @vscode/vsce`
- `vsce package`
<!-- `vsce publish`>