# TCGlite

## Environment Setup

Create a `.env.local` file for Pocketbase type generation.

```
PB_TYPEGEN_URL=http://127.0.0.1:8090
PB_TYPEGEN_EMAIL=adminEmail
PB_TYPEGEN_PASSWORD=adminPassword
```

Optionally create `.vscode/tasks.json` with the following contents to automatically start the development environment.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Frontend Dev Server",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "${workspaceFolder}/app"
      },
      "isBackground": true,
      "problemMatcher": [],
      "runOptions": { "runOn": "folderOpen" },
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "Pocketbase Typegen",
      "type": "shell",
      "command": "npm run typegen",
      "options": {
        "cwd": "${workspaceFolder}/app"
      },
      "isBackground": true,
      "problemMatcher": [],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "PocketBase API",
      "type": "shell",
      "command": "./pocketbase serve",
      "options": {
        "cwd": "${workspaceFolder}/api"
      },
      "isBackground": true,
      "problemMatcher": [],
      "runOptions": { "runOn": "folderOpen" },
      "group": {
        "kind": "build",
        "isDefault": true
      }
    }
  ]
}
```
