module.exports = {
  daemon: true,
  requires: { bundle: "ai", },
  set: [{
    method: "local.set",
    params: {
      url: "{{input.event[1]}}"
    }
  }],
  restart: [{
    method: "script.restart"
  }],
  run: [
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
          "trigger": "set",
        }, {
          "event": "/\\[ComfyUI-Manager\\] Restarting to reapply dependency installation/i",
          "trigger": "restart",
        }, {
          "event": "/After restarting ComfyUI, please refresh the browser/i",
          "trigger": "restart",
        }, {
          "event": "/errno/i",
          "break": false
        }, {
          "event": "/error:/i",
          "break": false
        }]
      }
    }
  ]
}
