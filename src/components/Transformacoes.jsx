import { useEffect, useState } from 'react';
import { ehImagem, linkTransformado, tamanho } from '../filestack';

// Cada variação é só um link diferente no CDN; nada é processado no site.
const VARIACOES = [
  { nome: 'Original', tarefa: null },
  { nome: 'Largura 300 px', tarefa: 'resize=width:300' },
  { nome: 'Convertida para WebP', tarefa: 'output=format:webp' },
];

function Variacao({ arquivo, nome, tarefa, anotar }) {
  const url = tarefa ? linkTransformado(arquivo.handle, tarefa) : arquivo.url;
  const [peso, setPeso] = useState(null);
  const [medidas, setMedidas] = useState(null);

  useEffect(() => {
    let ativo = true;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.blob();
      })
      .then((b) => ativo && setPeso({ bytes: b.size, tipo: b.type }))
      .catch((erro) => {
        if (!ativo) return;
        setPeso({ erro: erro.message });
        anotar(`${nome}: ${erro.message}`, 'erro');
      });
    return () => {
      ativo = false;
    };
  }, [url, nome, anotar]);

  return (
    <figure className="variacao">
      <div className="quadro">
        <img src={url} alt={nome} onLoad={(e) => setMedidas([e.target.naturalWidth, e.target.naturalHeight])} />
      </div>
      <figcaption>
        <strong>{nome}</strong>
        <span>
          {medidas ? `${medidas[0]} × ${medidas[1]} px` : '…'} ·{' '}
          {peso?.erro ? peso.erro : peso ? `${tamanho(peso.bytes)} · ${peso.tipo}` : '…'}
        </span>
        <code>{url.replace('https://', '')}</code>
      </figcaption>
    </figure>
  );
}

export default function Transformacoes({ arquivos, anotar }) {
  const imagens = arquivos.filter(ehImagem);
  const [escolhida, setEscolhida] = useState(null);
  const arquivo = imagens.find((f) => f.handle === escolhida) ?? imagens[0];

  return (
    <section className="cartao largo">
      <h2>Transformações pelo link</h2>
      {!arquivo ? (
        <p className="vazio">Envie uma imagem para ver as variações.</p>
      ) : (
        <>
          {imagens.length > 1 && (
            <select value={arquivo.handle} onChange={(e) => setEscolhida(e.target.value)} data-testid="escolher-imagem">
              {imagens.map((f) => (
                <option key={f.handle} value={f.handle}>
                  {f.filename}
                </option>
              ))}
            </select>
          )}
          <div className="variacoes" data-testid="transformacoes">
            {VARIACOES.map((v) => (
              <Variacao key={`${arquivo.handle}-${v.nome}`} arquivo={arquivo} anotar={anotar} {...v} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
