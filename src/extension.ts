import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as process from 'process'
import { JSDOM } from 'jsdom';
import * as nodessh from 'node-ssh'
import { get_partition_to_nodes, populate_parts_and_nodes } from "./logic"

var the_output_channel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {

	const provider = new SLURMView(context.extensionUri);


	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(SLURMView.viewType, provider));

	the_output_channel = vscode.window.createOutputChannel('SLURM++');
	the_output_channel.appendLine("Welcome to SLURM++.")
	the_output_channel.show();

}

class SLURMView implements vscode.WebviewViewProvider {

	public static readonly viewType = 'slurm.main';

	private _view?: vscode.WebviewView;

	public ssh_handle: null | nodessh.NodeSSH = null;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public async resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = await this._getHtmlForWebview(webviewView.webview);

	}

	public async do_populate(port: number, username_at_host: string) {
		if (this._view) {
			console.log("in do populate")
			var username_at_host_arr = username_at_host.split("@")
			var p2n_ssh = await get_partition_to_nodes(username_at_host_arr[1], username_at_host_arr[0], path.join(os.homedir(), ".ssh", "id_rsa"), port)
			var p2n = p2n_ssh.p2n
			this.ssh_handle = p2n_ssh.ssh_handle
			this._view.webview.postMessage({ 'p2n': p2n })
		}
	}

	public async send_real_job_cmd(cmd: string) {
		var outer_view = this._view
		if (this.ssh_handle?.isConnected()) {
			let queued_regex = /srun: job \d+ queued and waiting for resources/g
			let ready_regex = /srun: job \d+ has been allocated resources/g
			this.ssh_handle.execCommand(cmd, {
				onStdout(result) { the_output_channel.appendLine(result.toString('utf-8')) },
				onStderr(result) {
					the_output_channel.appendLine(result.toString('utf-8'))
					if (result.toString('utf-8').match(queued_regex)) {
						if (outer_view) {
							outer_view.webview.postMessage({ 'slurm_response': "queued" })
							console.log("QUEUED!!")
						}
					}
					if (result.toString('utf-8').match(ready_regex)) {
						if (outer_view) {
							outer_view.webview.postMessage({ 'slurm_response': "running" })
							console.log("RUNNING!!")
						}
					}
				}
			});

		}

	}

	private async _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'do_ssh_connection':
						// Call the function defined in extension.ts
						var port = Number(message.ssh_options['port'])
						var username_at_host = message.ssh_options['username_at_host']

						this.do_populate(port, username_at_host);
						break;
					case 'do_submit_job':
						this.send_real_job_cmd(message.cmd_text);
						break;
				}
			}
		);

		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();
		let fetch_path_ = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.html').path;
		const content = fs.readFileSync(fetch_path_, 'utf-8');
		const dom: JSDOM = new JSDOM(content);
		const inner_doc: Document = dom.window.document;
		var head: HTMLHeadElement = inner_doc.getElementsByTagName("head").namedItem("main_head")!

		for (let path of [styleResetUri, styleVSCodeUri, styleMainUri]) {
			var sty = inner_doc.createElement('link');
			sty.href = String(path)
			sty.rel = "stylesheet"
			head.appendChild(sty)
		}

		var scr = inner_doc.createElement('script')
		scr.src = String(scriptUri)
		scr.defer = true;
		inner_doc.body.appendChild(scr)

		const modifiedHtml: string = dom.serialize();

		return modifiedHtml
	};

}


function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}