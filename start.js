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
          "event": "/errno/i",
          "break": false
        }, {
          "event": "/error:/i",
          "break": false
        }]
      }
    },
    {
      when: "{{input.event && input.event[1]}}",
      method: "local.set",
      params: {
        url: "{{input.event[1]}}"
      }
    }
  ]
}
