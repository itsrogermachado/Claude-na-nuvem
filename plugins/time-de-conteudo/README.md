# Plugin: Time de Conteúdo

Oito funções de um time de conteúdo dentro do Claude, mais uma skill para guardar o contexto da marca. Montado a partir do guia "Um time de conteúdo dentro do Claude".

| Skill | Entrega |
|---|---|
| `contexto-da-marca` | Monta e guarda o bloco de contexto (use primeiro) |
| `roteirista` | Estrutura, gancho e falas. **Comece por esta.** |
| `estrategista` | Pauta, pilar e calendário |
| `designer-de-thumbnail` | Briefing de composição, não a imagem |
| `editor-de-video` | Decupagem e ordem de cena, não o corte |
| `especialista-em-seo` | Hipótese de palavra-chave. Confira por fora |
| `gestor-de-redes` | Legenda e variação por plataforma |
| `pesquisador-de-tendencia` | Leitura do que circula. É a mais frágil |
| `gestor-de-comunidade` | Resposta a comentário e triagem de DM |

## Instalar no app do Claude (desktop)
1. Abra o app no computador, vá em **Customize → Plugins → Create plugin → Upload plugin**.
2. Envie o arquivo `time-de-conteudo.zip` desta pasta.
3. Na conversa, cole o bloco de contexto (ou chame `/contexto-da-marca`) e depois chame uma função, por exemplo `/roteirista`.

## Instalar no Claude Code
```
claude --plugin-dir ./plugins/time-de-conteudo
```

## Dica
Depois de duas semanas, apague a pasta `skills/` das funções que você não chamou. Um time de três afiado responde melhor que um menu de oito.
