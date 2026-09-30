# Reel: "Mentiram pra você sobre Fred"

**Arquivo final:** `reel_fred_1080x1920.mp4`. Especificações: 1080×1920, 30 fps, 93 s, H.264 + AAC, -14 LUFS.
**Narração:** áudio do @canalfazofacao, usado com autorização. **Edição:** Remotion (React/JavaScript), em `remotion/`.

## Dados na tela (todos checados)
- **158 gols no Brasileirão:** 1º da era dos pontos corridos e 2º da história, atrás de Roberto Dinamite (190). Fontes: CNN Brasil e Lance.
- **Copa do Brasil:** Fred 37, Romário 36, Viola 29. Fonte: site do Fluminense e ND+.
- **199 gols pelo Fluminense.** Fontes: Lance e site do Fluminense.
- **Copa das Confederações 2013:**
  - Brasil 3x0 Espanha na final, no Maracanã, com 2 gols do Fred.
  - Brasil 4x2 Itália em Salvador, com 2 gols do Fred (66' e 88').
  - 5 gols no torneio e Chuteira de Prata.
- **Brasileirão 2009:** 99% de chance de rebaixamento. Arrancada de 11 jogos, com 7 vitórias e 4 empates. Campeão em 2010. Fontes: site do Fluminense e Lance.
- **Títulos brasileiros com o Fluminense:** 2010 e 2012.
- **Volta ao Fluminense depois da Copa de 2014:** foto do treino nas Laranjeiras em 29/07/2014, da conta oficial "fotosflu".

A narração diz que ele foi "o terceiro ou segundo melhor jogador" da Copa das Confederações. Esse dado não é oficial (a Bola de Ouro foi para Neymar, Iniesta e Paulinho), então a tela mostra o prêmio verificável: a **Chuteira de Prata**.

## Imagens: todas com licença livre
Nenhum lance de TV nem foto de agência privada foi usado.
- **Fluminense FC (fotosflu)** (CC BY 2.0): [fred_grito.jpg](https://www.flickr.com/photos/98895180@N08/13464939123), [fred_vitoria.jpg](https://www.flickr.com/photos/98895180@N08/14104533152), [fred_capitao.jpg](https://www.flickr.com/photos/98895180@N08/13920964147), [fred_corre.jpg](https://www.flickr.com/photos/98895180@N08/13913659720), [fred_jogada.jpg](https://www.flickr.com/photos/98895180@N08/13913632127), [fred_comemora.jpg](https://www.flickr.com/photos/98895180@N08/13917838041), [fred_treino_ago14.jpg](https://www.flickr.com/photos/98895180@N08/14867371517), [fred_treino_jul14.jpg](https://www.flickr.com/photos/98895180@N08/14778258625)
- **Agência Brasil** (CC BY 3.0 br): [copa14_cabeceio.jpg](https://commons.wikimedia.org/wiki/File:Brazil_and_Croatia_match_at_the_FIFA_World_Cup_2014-06-12_(13).jpg), [copa14_croacia.jpg](https://commons.wikimedia.org/wiki/File:Brazil_and_Croatia_match_at_the_FIFA_World_Cup_2014-06-12_(20).jpg)
- **copa2014.gov.br** (CC BY 3.0): [copa14_mexico.jpg](https://commons.wikimedia.org/wiki/File:Brazil_and_Mexico_match_at_the_FIFA_World_Cup_2014-06-17_(18).jpg), [copa14_gol.jpg](https://commons.wikimedia.org/wiki/File:Gol_fred.jpg)
- **Tânia Rêgo/ABr** (CC BY 3.0 br): [confed_podio.jpg](https://commons.wikimedia.org/wiki/File:Confed.Cup2013Champions.jpg), [confed_torcida9.jpg](https://commons.wikimedia.org/wiki/File:ConfedCup2013Champions10.jpg), [confed_final.jpg](https://commons.wikimedia.org/wiki/File:ConfedCup2013Champions15.jpg), [fred_taca.jpg](https://commons.wikimedia.org/wiki/File:ConfedCup2013Champions2.jpg), [fred_chuteira.jpg](https://commons.wikimedia.org/wiki/File:Fred_Silver_Boot,_Confederations_Cup_2013.jpg)
- **Alexandre M. B. Berwanger** (CC0): [torcida_2024.jpg](https://commons.wikimedia.org/wiki/File:FFCxALILiberta2024.jpg)
- **Fluminense FC** (Public domain): [escudo_flu.png](https://commons.wikimedia.org/wiki/File:Fluminense_FC_escudo.png)
- **LengaLenga** (CC BY-SA 4.0): [torcida_panorama.jpg](https://commons.wikimedia.org/wiki/File:Panorama_torcida_Fluminense_-_08.08.2023.jpg), [torcida_bravo.jpg](https://commons.wikimedia.org/wiki/File:Torcida_do_Fluminense_-_Bravo_52.jpg)
- **Alexandre M. B. Berwanger** (CC BY-SA 4.0): [torcida_maracana.jpg](https://commons.wikimedia.org/wiki/File:Torcida_Tricolor_no_Maracanã.jpg)
- **Milly barzellai** (CC BY-SA 4.0): [ronaldo.jpg](https://commons.wikimedia.org/wiki/File:Ronaldo_2002_cropped.jpg)
- **Bryan Berlin** (CC BY-SA 4.0): [romario.jpg](https://commons.wikimedia.org/wiki/File:Romário_Brazil_V_Morocco_13_June_2026-29.jpg)
- **Fabio Rodrigues Pozzebom/ABr** (CC BY 3.0 br): [neymar.jpg](https://commons.wikimedia.org/wiki/File:Brazil-Japan,_Confederations_Cup_2013_(15)_(cropped).jpg)

## Crédito para colar na descrição do post
> Fotos: Agência Brasil (CC BY 3.0 br) | Alexandre M. B. Berwanger (CC BY-SA 4.0) | Alexandre M. B. Berwanger (CC0) | Bryan Berlin (CC BY-SA 4.0) | Fabio Rodrigues Pozzebom/ABr (CC BY 3.0 br) | Fluminense FC (Public domain) | Fluminense FC (fotosflu) (CC BY 2.0) | LengaLenga (CC BY-SA 4.0) | Milly barzellai (CC BY-SA 4.0) | Tânia Rêgo/ABr (CC BY 3.0 br) | copa2014.gov.br (CC BY 3.0). Via Wikimedia Commons e Flickr.

## Renderizar de novo
```bash
cd remotion && npm install
python3 tools/make_music.py public/music.wav   # trilha original
npx remotion render Reel out/reel_raw.mp4 --gl=swangle
```
