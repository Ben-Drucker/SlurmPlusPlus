import path from "path"
import os from "os"
import * as nodessh from 'node-ssh'

const requirejs = require('requirejs');

export class NodeID2 {
    title: string;
    architecture: string;
    partitions: string;
    constructor(title: string, architecture: string, partitions: string) { this.title = title; this.architecture = architecture; this.partitions = partitions };
    toString() {
        return `HPC Node: ${this.title} (${this.architecture})`;
    };
};

export async function get_partition_to_nodes(
    host_ = 'deception02.pnl.gov',
    username_ = 'druc594',
    privateKeyPath_ = "/Users/druc594/.ssh/id_rsa",
    port_ = 22
) {//path.join(os.homedir(), ".ssh/id_rsa")) {
    var ssh = new nodessh.NodeSSH();

    ssh = await ssh.connect({
        host: host_,
        username: username_,
        privateKeyPath: privateKeyPath_,
        port: port_
    })

    if (ssh.isConnected()) {
        console.log("SSH Connected!")
    }


    var scontrol_nodes: string;
    var scontrol_partitions: string;

    var nodes_list: Array<NodeID2>;
    scontrol_nodes = ""
    scontrol_partitions = ""
    await ssh.execCommand("scontrol -o show node").then((result) => { scontrol_nodes = result.stdout });

    var nodes_pat = new RegExp("NodeName=([A-Za-z0-9_-]+) Arch=([A-Za-z0-9_-]+).*Partitions=([A-Za-z0-9_-]+).*", "g");
    var nodes_matches = [...scontrol_nodes.matchAll(nodes_pat)]
    nodes_list = []
    for (let match of nodes_matches) {
        var nid2 = new NodeID2(match[1], match[2], match[3])
        nodes_list = nodes_list.concat([nid2])
    }

    var partitions_to_nodes: { [key: string]: Array<NodeID2> } = {}
    for (let node of nodes_list) {
        if (node.partitions in partitions_to_nodes) {
            partitions_to_nodes[node.partitions] = partitions_to_nodes[node.partitions].concat([node])
        } else {
            partitions_to_nodes[node.partitions] = [node]
        }
    }
    return { p2n: partitions_to_nodes, ssh_handle: ssh }
}

export async function populate_parts_and_nodes(p2n: { [key: string]: Array<NodeID2> }, partition_drop_down: HTMLSelectElement, nodes_include_list: HTMLElement, nodes_exclude_list: HTMLElement) {
    console.log("Partitions Found:")
    var add_options: Array<string> = [];
    for (let part of Object.keys(p2n)) {
        console.log(part)
        add_options = add_options.concat([`<option>${part}</option>`])
    }
    var new_inner_html: string = add_options.join("\n")
    var selectedOption: string = "";
    partition_drop_down.innerHTML = new_inner_html
    partition_drop_down.addEventListener('change', function () {
        selectedOption = partition_drop_down.value;
    })
    var relevant_nodes = p2n[selectedOption]
    var relevant_node_inputs: Array<string> = []
    for (let rn of relevant_nodes) {
        relevant_node_inputs = relevant_node_inputs.concat([`<input type="checkbox">${rn.title} (${rn.partitions})</input>`])
    }
    nodes_include_list.innerHTML = relevant_node_inputs.join("")
    nodes_exclude_list.innerHTML = relevant_node_inputs.join("")
}
var p2n: { [key: string]: NodeID2[]; };

