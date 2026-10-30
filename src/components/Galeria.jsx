import { NOMES_FONTES, ehImagem, tamanho } from '../filestack';

export default function Galeria({ arquivos }) {
  return (
    <section className="cartao largo">
      <h2>
        Arquivos enviados <span className="contagem">{arquivos.length}</span>
      </h2>
      {arquivos.length === 0 ? (
        <p className="vazio">Nada enviado ainda.</p>
      ) : (
        <ul className="galeria" data-testid="galeria">
          {arquivos.map((f) => (
            <li key={f.handle}>
              <div className="miniatura">
                {ehImagem(f) ? (
                  <img src={f.url} alt={f.filename} loading="lazy" />
                ) : (
                  <span>{f.mimetype?.split('/')[1] ?? '?'}</span>
                )}
              </div>
              <div className="dados">
                <a href={f.url} target="_blank" rel="noreferrer" title={f.filename}>
                  {f.filename}
                </a>
                <span>
                  {f.mimetype} · {tamanho(f.size)}
                </span>
                <span>
                  {f.origem} · {NOMES_FONTES[f.source] ?? f.source}
                </span>
                <code>{f.handle}</code>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
