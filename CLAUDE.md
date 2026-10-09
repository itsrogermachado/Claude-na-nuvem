# Como o Roger quer a entrega dos reels

- **Não mandar o vídeo pelo chat** (nem prévia comprimida). Só subir no GitHub e mandar o link de download.
- Entregar o **master em qualidade máxima** como `reels/<data>-<nome>/reel_<nome>_1080x1920_master.mp4`, via Git LFS (o `.gitattributes` já rastreia `reels/**/*_master.mp4`). É o render direto do Remotion (CRF 14), com só o áudio normalizado para -14 LUFS e o vídeo copiado (`-c:v copy`).
- Link de download direto, que funciona sem login (o repositório é público):
  `https://media.githubusercontent.com/media/itsrogermachado/Claude-na-nuvem/<branch>/reels/<pasta>/<arquivo>_master.mp4`
  Antes de mandar, conferir com `curl -sIL <link> | grep -i content-length` se o tamanho bate com o arquivo local.
- Para mudanças só de som (volume, efeitos, trilha), não renderizar o vídeo de novo: gerar só o áudio com `npx remotion render Reel out/audio.wav --codec=wav --config=remotion.audio.config.ts` e trocar a faixa no MP4 com `-c:v copy`.

# Estilo de edição
- Imagem sem filtro, correção de cor ou nitidez. Voz sem efeito (só ganho e o -14 LUFS final).
- A voz fica bem acima dos efeitos e da trilha (cerca de 13 dB acima do conjunto).
- As animações ficam numa faixa no topo, sem cobrir o rosto. A legenda fica logo abaixo dela.
