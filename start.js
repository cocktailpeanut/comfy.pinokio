module.exports = {
  daemon: true,
  requires: { bundle: "ai", },
  run: [
    // [index 0] Start ComfyUI
    {
      id: "start_comfyui",
      method: "shell.run",
      params: {
        venv: "env",
        env: {
          PYTORCH_ENABLE_MPS_FALLBACK: "1",
          TOKENIZERS_PARALLELISM: "false"
        },
        path: "app",
        message: [
          "{{platform === 'win32' && gpu === 'amd' ? 'python main.py --directml --enable-manager' : 'python main.py --enable-manager'}}"
        ],
        on: [{
          "event": "/starting server.+(http:\/\/[a-zA-Z0-9.]+:[0-9]+)/i",
          "done": true
        }, {
          "event": "/\\[ComfyUI-Manager\\] Restarting to reapply dependency installation/i",
          "kill": true
        }, {
          "event": "/After restarting ComfyUI, please refresh the browser/i",
          "kill": true
        }, {
          "event": "/errno/i",
          "break": false
        }, {
          "event": "/error:/i",
          "break": false
        }]
      }
    },
    // [index 1] Single conditional jump — routes to set_url on normal startup,
    // or to manager_restart when Manager killed ComfyUI for dep installation.
    // input.event[1] contains the URL on normal startup; absent on Manager restart.
    // Pass the URL through jump params since jump resets input.
    {
      method: "jump",
      params: {
        id: "{{input.event && input.event[1] ? 'set_url' : 'manager_restart'}}",
        params: {
          url: "{{input.event && input.event[1] ? input.event[1] : ''}}"
        }
      }
    },

    // [index 2] Manager restart path
    {
      id: "manager_restart",
      method: "jump",
      params: {
        id: "start_comfyui"
      }
    },

    // [index 4] Normal startup — set the URL for the Open WebUI button
    {
      id: "set_url",
      method: "local.set",
      params: {
        url: "{{input.event[1]}}"
        url: "{{input.url}}"
      }
    }
  ]
}
