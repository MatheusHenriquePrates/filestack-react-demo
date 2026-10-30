import { useMemo, useState } from 'react';
import { client } from 'filestack-react';

// Envio sem a janela pronta: arquivo do computador pelo SDK e arquivo da internet por link.
export default function EnvioPorCodigo({ apikey, aoEnviar, anotar }) {
  const cliente = useMemo(() => client.init(apikey), [apikey]);
  const [progresso, setProgresso] = useState(null);
  const [link, setLink] = useState('');
  const [enviandoLink, setEnviandoLink] = useState(false);

  const enviarArquivo = async (evento) => {
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!arquivo) return;
    setProgresso(0);
    const inicio = performance.now();
    try {
      const res = await cliente.upload(arquivo, { onProgress: ({ totalPercent }) => setProgresso(totalPercent) });
      const segundos = ((performance.now() - inicio) / 1000).toFixed(1).replace('.', ',');
      // O upload() devolve um objeto com getters e "name" (a janela devolve "filename"); espalhar com {...} perde os campos.
      const enviado = { handle: res.handle, url: res.url, filename: res.name, mimetype: res.mimetype, size: res.size, source: 'sdk' };
      aoEnviar({ filesUploaded: [enviado] });
      anotar(`Código (SDK): ${enviado.filename} levou ${segundos} s`, 'info');
    } catch (erro) {
      anotar(`Código (SDK): ${erro?.message ?? 'falha no envio'}`, 'erro');
    } finally {
      setProgresso(null);
    }
  };

  const enviarLink = async (evento) => {
    evento.preventDefault();
    if (!link.trim()) return;
    setEnviandoLink(true);
    try {
      const res = await cliente.storeURL(link.trim());
      aoEnviar({ filesUploaded: [{ ...res, source: 'url' }] });
      setLink('');
    } catch (erro) {
      anotar(`Link (SDK): ${erro?.message ?? 'falha ao salvar o link'}`, 'erro');
    } finally {
      setEnviandoLink(false);
    }
  };

  return (
    <section className="cartao">
      <h2>Envio por código</h2>
      <p className="ajuda">Sem janela pronta: o próprio site chama o SDK.</p>

      <label className="secundario arquivo">
        Escolher arquivo
        <input type="file" onChange={enviarArquivo} data-testid="sdk-arquivo" />
      </label>
      {progresso !== null && (
        <div className="barra" data-testid="sdk-progresso">
          <div style={{ width: `${progresso}%` }} />
          <span>{progresso}%</span>
        </div>
      )}

      <form className="linha" onSubmit={enviarLink}>
        <input
          type="url"
          placeholder="https://… link de uma imagem"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          data-testid="sdk-link"
        />
        <button className="secundario" disabled={enviandoLink} data-testid="sdk-enviar-link">
          {enviandoLink ? 'Salvando…' : 'Salvar link'}
        </button>
      </form>
    </section>
  );
}
