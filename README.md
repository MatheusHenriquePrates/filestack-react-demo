# Filestack + React: projeto de avaliação

Projeto React + Vite que usei para avaliar o plano gratuito do [Filestack](https://www.filestack.com/).
O relatório completo, com os testes, os limites do plano, os pontos fortes e fracos e as alternativas, está em [relatorio-filestack.pdf](relatorio-filestack.pdf).

## O que tem na página

- **Janela flutuante** (`PickerOverlay`), com dois modos de restrição: só imagens e até 1 MB
- **Área de arrastar e soltar** (`PickerDropPane`)
- **Janela embutida** (`PickerInline`)
- **Envio pelo código** (`client.upload`) com barra de progresso, e salvar a partir de um link (`client.storeURL`)
- **Galeria** dos arquivos enviados, com tipo, tamanho e identificador
- **Transformações pelo link**: original, largura de 300 px e WebP lado a lado, com o tamanho de cada um

## Como rodar

Precisa do Node 18 ou mais novo e de uma conta no Filestack (o plano gratuito serve).

```bash
npm install
cp .env.example .env   # coloque a sua chave em VITE_FILESTACK_KEY
npm run dev
```

A chave aparece no painel do Filestack logo depois do cadastro.

## Ajustes que precisei fazer

- **Janela embutida cobrindo a flutuante.** As duas usam o mesmo `z-index` máximo; com as duas na mesma página, a embutida cobre os botões da flutuante. Resolvi com `isolation: isolate` no contêiner da embutida ([src/index.css](src/index.css)).
- **Janela flutuante fechando sozinha no modo de desenvolvimento.** Com o `StrictMode`, o `filestack-react` fecha e reabre a janela ao montar, e esse fechamento dispara o `onClose`. A janela não depende dele para desmontar ([src/App.jsx](src/App.jsx)).
- **Resposta do envio pelo código.** O `client.upload()` devolve `name` em vez de `filename`, em propriedades que somem ao copiar o objeto com `{ ...res }`. Os campos são lidos um a um ([src/components/EnvioPorCodigo.jsx](src/components/EnvioPorCodigo.jsx)).

## Estrutura

```
src/
  App.jsx                    página e as três janelas
  filestack.js               chave, fontes de envio e utilitários
  components/
    EnvioPorCodigo.jsx       envio pelo SDK e por link
    Galeria.jsx              arquivos enviados
    Transformacoes.jsx       variações pelo link de entrega
    Registro.jsx             eventos de envio
```

Dica: `?so=arrastar,embutida` no endereço mostra só essas seções da página.

## Segurança

A chave do Filestack fica no navegador, e com ela qualquer pessoa consegue enviar arquivos para a sua conta. Para produção, ligue as políticas com assinatura e a lista de domínios permitidos no painel do Filestack, e nunca coloque o segredo da aplicação no código do site.
