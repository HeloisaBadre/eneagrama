# Instrumento adaptativo de eneatipo (Naranjo / Ichazo)

Instrumento psicológico adaptativo para detectar **centro dominante (tríade)**, **tipo**,
**paixão**, **fixação** e **subtipo (instinto dominante)**, com uma **camada anti-distorção**
que os testes de eneagrama comuns não têm: ele cruza a resposta consciente contra padrões que
a pessoa não está monitorando (itens gêmeos, desejabilidade social, tempo de resposta
silencioso e consistência entre domínios).

Base teórica: exclusivamente **Claudio Naranjo** (*Character and Neurosis* e a coleção
*Psicologia dos eneatipos*, um volume por paixão) e **Oscar Ichazo**.

> **Nota de honestidade metodológica.** Os pesos e limiares (desejabilidade social,
> imediatismo, ambiguidade) são **heurísticas transparentes e ajustáveis**, não valores
> validados por amostra empírica. O instrumento sinaliza isso ao usuário no relatório final,
> em vez de fingir precisão que ainda não tem. Para validar de verdade seria preciso coletar
> respostas de pessoas já tipadas e recalibrar `LIMIARES` e `PESOS` em `scoring.js`.

## Como as perguntas são escritas

Cinco regras governam o banco inteiro. Três delas são verificadas por teste automático.

1. **Toda pergunta é uma situação, não uma auto-avaliação.** Nada de "que imagem você passa"
   ou "o que você sente quando está sozinho": isso exige um acesso ao próprio mundo interno
   que muita gente não tem, e que o eneatipo 9 tem menos que todos, porque a paixão dele é o
   auto-esquecimento. Os itens são cenas de infância ("quando você chorava, o que acontecia
   na sua casa?") e cenas do presente ("o chefe te chama e não diz o assunto; o que passa na
   sua cabeça no caminho?"). Nenhuma alternativa pode ser respondida com "depende".
2. **O enunciado fixa o comportamento e as alternativas variam a motivação.** Um 8, um 6
   sexual, um 4 sexual e um 1 sexual podem todos brigar na reunião; o que difere é o que
   aconteceu por dentro um segundo antes.
3. **Equilíbrio estrutural.** Na Fase 1, cada item tem exatamente uma alternativa por tipo,
   todas com o mesmo eixo e o mesmo peso. Na Fase 2, cada tipo tem o mesmo número de
   alternativas por item. Nenhum tipo acumula vantagem por aparecer mais vezes.
4. **Cada tipo aparece em mais de um subtipo.** Das duas alternativas de cada tipo na Fase 2,
   uma é a expressão prototípica e a outra é a do subtipo que menos parece com o estereótipo
   (o 6 contrafóbico, o 4 tenaz da autopreservação, o 3 antivaidoso, o 7 antissete social).
5. **Ninguém é obrigado a mentir.** Toda pergunta oferece "Nenhuma dessas se parece comigo".
   Ela não pontua, não conta como exposição do tipo, e entra no índice de confiabilidade.

## As quatro fases

| Fase | O que faz | Itens no banco | Itens aplicados |
|---|---|---|---|
| 1 | Triagem: pontua tríade **e** os nove tipos | 14 (6 de infância e crença, 8 do presente) + 3 desempates | 12 |
| 2 | Tipo: itens da tríade vencedora, das tríades dos tipos fortes, e itens **cruzados** entre candidatos de tríades diferentes | 41 por tríade-conjunto + 9 desempates + 46 cruzados | ~19 |
| 3 | Instinto dominante | 12 + 3 desempates | 6 |
| 4 | Subtipo dentro do tipo encontrado (27 subtipos de Naranjo) | 27 | 3 |

Total: cerca de **41 perguntas** por aplicação.

A Fase 1 **não é um portão**. Ela produz candidatos; se o tipo mais forte for de outra tríade,
a Fase 2 testa as duas e aplica perguntas cruzadas (8 x 6, 8 x 4, 1 x 3, 9 x 5...) que
comparam os dois finalistas pela motivação. Foi isso que corrigiu o caso em que um 6 sexual
ou um 4 sexual saía como 8.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # motor de pontuação e integridade do banco (Vitest)
npm run build      # build estático em dist/  (base relativa: hospedável em qualquer lugar)
npm run preview
```

Cada push na `main` publica em https://heloisabadre.github.io/eneagrama/ (ver
`.github/workflows/deploy.yml`, que roda `npm test` antes do build).

## Arquitetura

```
src/
  data/
    questions.json     # BANCO DE PERGUNTAS — toda a lógica de conteúdo, sem hardcode na UI
    results.js         # textos de resultado (tom de insight de neurose, não horóscopo)
  engine/
    scoring.js         # MOTOR DE PONTUACAO — puro, sem React/DOM
    fluxo.js           # FLUXO ADAPTATIVO — decide quais perguntas aparecem em cada fase
    scoring.test.js    # 11 testes do motor
    fluxo.test.js      # 12 testes do fluxo, da integridade do banco e dos casos-limite
  components/
    Landing.jsx  QuestionCard.jsx  ProgressBar.jsx  Report.jsx
  App.jsx              # máquina de estados das 4 fases
ferramentas/
  gerar_banco.py       # gera src/data/questions.json com as validações embutidas
  simular.mjs          # simulação com respondentes sintéticos (teste de viés estrutural)
```

### Formato de um item (questions.json)

```jsonc
{
  "id": "f1_01",
  "fase": 1,
  "dominio": "familia",            // trabalho | familia | amizade | romance | geral
  "cenario": "Quando você era criança e chorava…",
  "par_gemeo_id": null,            // id compartilhado com o item gêmeo (ou null)
  "indireto": false,               // item projetivo (ganha peso quando a desejabilidade é alta)
  "flag_desejabilidade_social": false,
  "opcional": false,               // itens opcionais saem primeiro no modo curto
  "alternativas": [
    {
      "id": "a",
      "texto": "…",
      "mapa": { "triade": "instintiva", "tipo": 8, "instinto": null },
      "eixo": "fixacao",           // fixacao | paixao | emocao (igual para todo o item)
      "peso": 1.2,                 // igual para todo o item
      "desejavel": false
    }
    // … uma por tipo, mais { "id": "z", "nula": true }
  ]
}
```

Itens de desempate têm `"separa": ["instintiva","mental"]` ou `[8, 6]`. Itens da Fase 4 têm
`"tipo_alvo": 4`.

### Como o tipo é decidido (`engine/scoring.js`)

Não é soma linear, e não é soma bruta. Cada resposta contribui com:

```
contribuição = peso_base
             × fator_gêmeo          (1.1 consistente · 0.9 divergente · 1.0 sem gêmeo)
             × fator_imediatismo    (resposta rápida numa alt. de paixão pesa mais)
             × fator_confiabilidade (autorrelato direto perde peso e itens indiretos ganham
                                      peso quando a desejabilidade social é alta)
```

E o score de cada tipo é uma **taxa de escolha**: o que foi escolhido dividido pelo que
poderia ter sido escolhido nos itens em que aquele tipo era opção (`pontuarPorTaxa`). Sem
isso, um tipo testado em 14 itens vence um testado em 4 mesmo com a mesma adesão. As
componentes entram com pesos diferentes (`PESOS`): Fase 1 conta 1, Fase 2 conta 1, itens
cruzados contam 1,5, porque comparam os dois finalistas cara a cara.

- **Fixação > emoção**: alternativas de fixação têm peso maior (1.2–1.5 vs 1.0), pois a
  fixação é o elemento mais estável e menos disfarçável pela persona.
- **Tempo de resposta**: capturado silenciosamente, normalizado pela mediana da própria
  pessoa. Como todas as alternativas de um item compartilham o eixo, isso nunca favorece um
  tipo dentro do item.
- **Itens gêmeos**: se divergem, **não são descartados**, viram dado sobre público × privado.
- **"Nenhuma dessas"**: não pontua, e a taxa de uso entra no índice de confiabilidade. É
  também o melhor termômetro de qual item está mal escrito.

Nenhuma pontuação numérica, tempo ou score de desejabilidade é mostrado durante o teste,
apenas no relatório final, de forma qualitativa.

## Ferramentas

```bash
python3 ferramentas/gerar_banco.py src/data/questions.json   # regenera o banco
node ferramentas/simular.mjs                                 # simula 27 respondentes sintéticos
N=200 node ferramentas/simular.mjs
```

A simulação não é validação empírica: é um teste de **viés estrutural**. Ela roda o mesmo
modelo de respondente (que erra, e que confunde o próprio tipo com os tipos parecidos segundo
Naranjo) contra o banco, e mede para onde o instrumento empurra quem erra.

## O que ainda falta

1. **Validação com pessoas reais**, já tipadas por entrevista, e recalibração dos pesos.
2. **Registrar a taxa de "nenhuma dessas" por item** na primeira aplicação em campo.
3. **Revisar os itens do eneatipo 8 na Fase 4** com o volume do E8 da coleção.
4. **Asas e linhas de estresse e segurança** não são tratadas.

## O que este instrumento NÃO é

Não é diagnóstico clínico nem substitui trabalho terapêutico. É um instrumento educativo,
heurístico, que serve como espelho para reflexão.
