# Skills instaladas

| Skill | Origem | Para que serve |
|---|---|---|
| `replica-*` (11 skills) | [Jakeschincariol/replica-skill](https://github.com/Jakeschincariol/replica-skill) (MIT) | Clonar um app/SaaS: recon → architect → design → build → backend → test → diff → entrepreneur → brand → launch → deploy |
| `reverse-engineer-anything` | [morluto/rea](https://github.com/morluto/rea) (MIT) | Engenharia reversa técnica (JS/Electron, sites, APK, .NET, binários, firmware, capturas de rede) |

A skill do REA são só as instruções. As ferramentas vêm do servidor MCP
`rea-agents` (Node 22.19+), que não está registrado neste repositório.

## Instalar no PC

```bash
# replica-skill (dentro do Claude Code)
/plugin marketplace add Jakeschincariol/replica-skill
/plugin install replica-skill@replica-skill

# REA (no terminal): registra o MCP e instala a skill
npx rea-agents setup
```
