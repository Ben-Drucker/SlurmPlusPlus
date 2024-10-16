//@ts-check

(function () {
    // @ts-ignore
    var vscode = acquireVsCodeApi();
    // This script will be run within the webview itself
    // It cannot access the main VS Code APIs directly.

    var full_slurm_cmd = "";

    function parse_ssh_form(X) {
        const inner_form = document.getElementById("ssh_form")
        /**@type {Array<HTMLFormElement>} */
        // @ts-ignore
        var targets = [...X.currentTarget]
        /**@type {Array<string>} */
        var selected_include_nodes = []
        /**@type {Array<string>} */
        var selected_exclude_nodes = []
        for (let target of targets) {
            switch (target.id) {
                case "ssh_port":
                    var port = target.value
                    break;
                case "username_at_host":
                    var username_at_host = target.value
                    break
            }
        }

        return ({ port: port, username_at_host: username_at_host })
    }


    var button = document.getElementById("ssh_con_button")
    var status_message = document.getElementById("status_message");

    function ssh_submit(X) {
        if (button && !button.disabled) {
            vscode.postMessage({ command: 'do_ssh_connection', ssh_options: parse_ssh_form(X) });
            if (status_message) {
                status_message.className = "loading_chip"
                status_message.innerHTML = `<div class="flex_form" style="font-size: 2.5vw">Status: Loading...</div>`
            }
        }
    }

    var submit_button = document.getElementById("submit_job_button")
    if (submit_button) {
        submit_button.addEventListener('click', () => {
            if (full_slurm_cmd != "") {
                vscode.postMessage({ command: "do_submit_job", cmd_text: full_slurm_cmd })
            }
        })
    }

    var hh;
    var mm;
    var ss;

    function previewConfig(X) {
        /**@type {Array<HTMLFormElement>} */
        // @ts-ignore
        var targets = [...X.currentTarget]
        /**@type {Array<string>} */
        var selected_include_nodes = []
        /**@type {Array<string>} */
        var selected_exclude_nodes = []
        for (let target of targets) {
            switch (target.id) {
                case ("form_hr"):
                    hh = Number(target.value)
                    break
                case ("form_min"):
                    mm = Number(target.value)
                    break
                case ("form_sec"):
                    ss = Number(target.value)
                    break
                case ("n_nodes"):
                    var n_nodes = target.value
                    break
                case ("n_tasks"):
                    var n_tasks = target.value
                    break
                case ("cpus_per_task"):
                    var cpus_per_task = target.value
                    break
                case ("partition_drop_down"):
                    var partition = target.value
                    break
                case ("account"):
                    var account = target.value
                    break
                case ("add_opts"):
                    var add_opts = target.value
                    break
                case ("execution_cmd"):
                    var execution_cmd = target.value
                    break
            }
            switch (true) {
                case /incl_node_.+/.test(target.id):
                    if (target.checked) {
                        selected_include_nodes = selected_include_nodes.concat([target.id])
                    }
                    break
                case /excl_node_.+/.test(target.id):
                    if (target.checked) {
                        selected_exclude_nodes = selected_exclude_nodes.concat([target.id])
                    }
                    break
            }

        }

        var exclude_string = ""
        if (selected_exclude_nodes.length > 0) {
            exclude_string = ` --exclude=${selected_exclude_nodes.join(",")}`
        }
        var include_string = ""
        if (selected_include_nodes.length > 0) {
            include_string = ` --nodelist=${selected_include_nodes.join(",")}`
        }


        let hhh = String(hh).padStart(2, "0")
        let mmm = String(mm).padStart(2, "0")
        let sss = String(ss).padStart(2, "0")

        let template = `srun --ntasks=${n_tasks} --cpus-per-task=${cpus_per_task} --nodes=${n_nodes} --time=${hhh}:${mmm}:${sss} --partition=${partition} --account=${account}${exclude_string}${include_string} ${add_opts}`;
        let arr = template.split(" ");
        let arr_slashes = [];
        for (let elt of arr) {
            arr_slashes = arr_slashes.concat(`${elt}${" ".repeat(39 - elt.length)}\\`)
        }

        arr_slashes = arr_slashes.concat(execution_cmd)
        let joined = arr_slashes.join("<br>")
        template = arr_slashes.join("\n")

        let container = document.getElementById("preview_container")
        if (container) {
            container.innerHTML = joined
        }
        full_slurm_cmd = template;
        submit_button.style.background = "var(--vscode-button-background)"
        submit_button.style.color = "var(--vscode-button-foreground)"
    }


    var form = document.getElementsByTagName("form").namedItem("main_form")
    if (form) {
        form.action = "javascript:;"
        form.onsubmit = previewConfig
    }
    var form = document.getElementsByTagName("form").namedItem("ssh_form")
    if (form) {
        form.action = "javascript:;"
        form.onsubmit = ssh_submit
    }

    /**
     * 
     * @param {*} p2n 
     * @param {HTMLSelectElement} partition_drop_down 
     * @param {HTMLElement} nodes_include_list 
     * @param {HTMLElement} nodes_exclude_list 
     */
    async function populate_parts_and_nodes(p2n, partition_drop_down, nodes_include_list, nodes_exclude_list) {
        console.log("Partitions Found:");
        var add_options = [];
        for (let part of Object.keys(p2n).sort()) {
            console.log(part);
            add_options = add_options.concat([`<option>${part}</option>`]);
        }
        var new_inner_html = add_options.join("\n");
        var selectedOption = Object.keys(p2n).sort()[0];
        partition_drop_down.innerHTML = new_inner_html;
        function fill_nodes_lists() {
            selectedOption = partition_drop_down.value
            var relevant_nodes = p2n[selectedOption];
            var relevant_node_inputs_incl = [];
            var relevant_node_inputs_excl = [];
            for (let rn of relevant_nodes) {
                relevant_node_inputs_incl = relevant_node_inputs_incl.concat([`<input type="checkbox" id="incl_node_${rn.title}">${rn.title}</input>`]); // (${rn.architecture})
                relevant_node_inputs_excl = relevant_node_inputs_excl.concat([`<input type="checkbox" id="excl_node_${rn.title}">${rn.title}</input>`]); // (${rn.architecture})
            }
            nodes_include_list.innerHTML = relevant_node_inputs_incl.join("<br>");
            nodes_exclude_list.innerHTML = relevant_node_inputs_excl.join("<br>");
        }
        partition_drop_down.addEventListener('change', fill_nodes_lists);
        partition_drop_down.className = "normal"
        fill_nodes_lists()
        status_message.className = "connected_chip"
        status_message.innerHTML = `<div class="flex_form" style="font-size: 2.5vw">Status: SSH Connected</div>`
    }

    var count_down_date;

    window.addEventListener("message", async function (event) {
        if ('p2n' in event['data']) {
            populate_parts_and_nodes(
                event['data']['p2n'],
                document.getElementById("partition_drop_down"),
                document.getElementById("nodes_include_list"),
                document.getElementById("nodes_exclude_list")
            )
        } else {
            if ('slurm_response' in event['data']) {
                if (event['data']['slurm_response'] == "queued") {
                    status_message.className = "loading_chip"
                    status_message.innerHTML = `<div class="flex_form" style="font-size: 2.5vw">Status: Job Queued</div>`
                }
                if (event['data']['slurm_response'] == "running") {
                    status_message.className = "job_running_chip"
                    status_message.innerHTML = `<div style="font-size: 2.5vw" class="flex_vert"><div>Status: Job Running </div> <div><hr> </div> <div>Time Remaining: <span id="timer" style="font-family: monospace">${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}</span></div></div>`
                    count_down_date = new Date().getTime() + (ss + 1 + mm * 60 + hh * 60 * 60) * 1000;
                    this.setInterval(countdown_timer, 1000)
                }
            }
        }
    })


    var timer_is_done = false;
    function countdown_timer() {
        if (timer_is_done) {
            var highestTimeoutId = setTimeout(";");
            for (var i = 0; i < highestTimeoutId; i++) {
                clearTimeout(i);
            }
            status_message.className = "connected_chip"
            status_message.innerHTML = `<div class="flex_form" style="font-size: 2.5vw">Status: SSH Connected <br> (Job Expired)</div>`
            return
        }
        var timer_elt = document.getElementById("timer")
        var now = new Date().getTime()
        var distance = count_down_date - now

        var hours = Math.floor((distance / (1000 * 60 * 60)));
        var minutes = Math.floor((distance - (hours * 60 * 60 * 1000)) / (1000 * 60))
        var seconds = Math.floor((distance - (hours * 60 * 60 * 1000) - (minutes * 1000 * 60)) / 1000)

        timer_elt.innerHTML = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        if (hours == 0 && minutes == 0 && seconds == 0) {
            timer_is_done = true
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        const form = document.getElementById("ssh_form")
        /**@type {HTMLFormElement} */
        const submit_button = document.getElementById('ssh_con_button')
        const inputs = form.querySelectorAll('input');

        function checkFormValidity() {
            if (inputs && submit_button) {
                console.log("---checking validity---")
                let allValid = true;

                // Check each input for validity
                inputs.forEach(input => {
                    if (!input.checkValidity()) {
                        allValid = false;
                    }
                });

                // If all inputs are valid, enable the submit button and add the active class
                if (allValid) {
                    console.log("ALL VALID!!!")
                    submit_button.disabled = false;
                    submit_button.style.background = "var(--vscode-button-background)"
                    submit_button.style.color = "var(--vscode-button-foreground)"
                } else {
                    submit_button.disabled = true;
                    submit_button.style.background = "var(--vscode-input-background)"
                    submit_button.style.color = "unset"
                }
            }
        }
        if (inputs) {
            inputs.forEach(input => {
                input.addEventListener('input', checkFormValidity);
            });
        }
    })

    document.addEventListener('DOMContentLoaded', function () {
        const form = document.getElementById('main_form');
        const submit_button = document.getElementById('main_form_submit_button');
        const inputs = form.querySelectorAll('input');

        // Function to check if all inputs are valid
        function checkFormValidity() {
            console.log("---checking validity---")
            let allValid = true;

            // Check each input for validity
            inputs.forEach(input => {
                if (!input.checkValidity()) {
                    allValid = false;
                }
            });

            // If all inputs are valid, enable the submit button and add the active class
            if (allValid) {
                console.log("ALL VALID!!!")
                submit_button.disabled = false;
                submit_button.style.background = "var(--vscode-button-background)"
                submit_button.style.color = "var(--vscode-button-foreground)"
            } else {
                submit_button.disabled = true;
                submit_button.style.background = "var(--vscode-input-background)"
                submit_button.style.color = "unset"
            }
        }

        // Add event listeners to each input to validate form on change
        inputs.forEach(input => {
            input.addEventListener('input', checkFormValidity);
        });
    });
})()