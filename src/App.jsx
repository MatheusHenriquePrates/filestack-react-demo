import { useCallback, useMemo, useState } from 'react';
import { PickerDropPane, PickerInline, PickerOverlay } from 'filestack-react';
import pacote from '../package.json';
import { FONTES, KEY, tamanho } from './filestack';
import EnvioPorCodigo from './components/EnvioPorCodigo';
import Galeria from './components/Galeria';
import Registro from './components/Registro';
import Transformacoes from './components/Transformacoes';

const versao = (nome) => pacote.dependencies[nome].replace('^', '');

// Os três modos da janela flutuante: livre, só imagens e com limite de tamanho.
const MODOS = {
  livre: { titulo: 'Enviar arquivos', opcoes: { maxFiles: 5 } },
  imagens: { titulo: 'Só imagens', opcoes: { maxFiles: 5, accept: ['image/*'] } },
  pequenos: { titulo: 'Até 1 MB', opcoes: { maxFiles: 5, maxSize: 1024 * 1024 } },
};

// ?so=arrastar,embutida mostra só essas seções (útil para isolar um teste).
const SO = new URLSearchParams(window.location.search).get('so')?.split(',');
const mostrar = (secao) => !SO || SO.includes(secao);

export default function App() {
  // A janela flutuante não usa o onClose para se desmontar: no StrictMode do React o próprio filestack-react
  // fecha e reabre a janela ao montar, e esse fechamento dispara o onClose. Cada clique remonta pela "vez".
  const [janela, setJanela] = useState(null);
  const [arquivos, setArquivos] = useState([]);
  const [registro, setRegistro] = useState([]);

  const anotar = useCallback((texto, tipo = 'info') => {
    const hora = new Date().toLocaleTimeString('pt-BR');
    setRegistro((atual) => [{ hora, texto, tipo }, ...atual].slice(0, 60));
  }, []);

  const receber = useCallback(
    (origem) => (resposta) => {
      const enviados = resposta.filesUploaded ?? [];
      const falhas = resposta.filesFailed ?? [];
      setArquivos((atual) => [...enviados.map((f) => ({ ...f, origem })), ...atual]);
      enviados.forEach((f) => anotar(`${origem}: ${f.filename} enviado (${tamanho(f.size)})`, 'ok'));
      falhas.forEach((f) => anotar(`${origem}: ${f.filename} falhou`, 'erro'));
    },
    [anotar],
  );

  const aoTerminarOverlay = useMemo(() => receber('Janela flutuante'), [receber]);
  const aoTerminarInline = useMemo(() => receber('Janela embutida'), [receber]);
  const aoTerminarArrastar = useMemo(() => receber('Arrastar e soltar'), [receber]);
  const aoEnviarCodigo = useMemo(() => receber('Código (SDK)'), [receber]);

  const eventos = useMemo(
    () => ({
      onFileUploadFailed: (arquivo, erro) => anotar(`${arquivo.filename}: ${erro?.message ?? 'falha no envio'}`, 'erro'),
    }),
    [anotar],
  );

  const opcoesOverlay = useMemo(
    () =>
      janela && {
        lang: 'pt',
        fromSources: FONTES,
        ...MODOS[janela.modo].opcoes,
        ...eventos,
        onClose: () => console.debug(`[bancada] janela flutuante fechada (${janela.modo})`),
      },
    [janela, eventos],
  );

  const opcoesInline = useMemo(() => ({ lang: 'pt', fromSources: FONTES, maxFiles: 5, ...eventos }), [eventos]);

  const opcoesArrastar = useMemo(
    () => ({
      lang: 'pt',
      ...eventos,
      dropPane: {
        overlay: false,
        showIcon: true,
        showProgress: true,
        customText: 'Arraste arquivos aqui ou clique para escolher',
      },
    }),
    [eventos],
  );

  return (
    <div className="pagina">
      <header className="topo">
        <div>
          <h1>Filestack · bancada de testes</h1>
          <p className="sub">
            React {versao('react')} + Vite · filestack-react {versao('filestack-react')} · filestack-js {versao('filestack-js')}
          </p>
        </div>
        <span className={`selo ${KEY ? 'ok' : 'falta'}`} data-testid="status-chave">
          {KEY ? 'Chave configurada' : 'Falta a chave no .env'}
        </span>
      </header>

      {!KEY ? (
        <section className="cartao">
          <h2>Configure a chave</h2>
          <p>
            Copie <code>.env.example</code> para <code>.env</code>, preencha <code>VITE_FILESTACK_KEY</code> com a chave do painel
            do Filestack e reinicie o <code>npm run dev</code>.
          </p>
        </section>
      ) : (
        <main className="grade">
          {mostrar('flutuante') && (
            <section className="cartao">
              <h2>Janela flutuante</h2>
              <p className="ajuda">Abre o seletor por cima da página. Os dois últimos botões testam as restrições.</p>
              <div className="botoes">
                {Object.entries(MODOS).map(([chave, { titulo }], i) => (
                  <button
                    key={chave}
                    className={i === 0 ? 'primario' : 'secundario'}
                    onClick={() => setJanela((j) => ({ modo: chave, vez: (j?.vez ?? 0) + 1 }))}
                    data-testid={`abrir-${chave}`}
                  >
                    {titulo}
                  </button>
                ))}
              </div>
              {janela && (
                <PickerOverlay
                  key={`${janela.modo}-${janela.vez}`}
                  apikey={KEY}
                  pickerOptions={opcoesOverlay}
                  onUploadDone={aoTerminarOverlay}
                />
              )}
            </section>
          )}

          {mostrar('arrastar') && (
            <section className="cartao">
              <h2>Arrastar e soltar</h2>
              <p className="ajuda">Área fixa na página, sem abrir janela.</p>
              <div className="area-arrastar" data-testid="area-arrastar">
                <PickerDropPane apikey={KEY} pickerOptions={opcoesArrastar} onUploadDone={aoTerminarArrastar} />
              </div>
            </section>
          )}

          {mostrar('codigo') && <EnvioPorCodigo apikey={KEY} aoEnviar={aoEnviarCodigo} anotar={anotar} />}

          {mostrar('embutida') && (
            <section className="cartao largo">
              <h2>Janela embutida</h2>
              <p className="ajuda">O mesmo seletor, desenhado dentro da página.</p>
              <PickerInline apikey={KEY} pickerOptions={opcoesInline} onUploadDone={aoTerminarInline}>
                <div className="embutida" data-testid="janela-embutida" />
              </PickerInline>
            </section>
          )}

          {mostrar('galeria') && <Galeria arquivos={arquivos} />}
          {mostrar('transformacoes') && <Transformacoes arquivos={arquivos} anotar={anotar} />}
          {mostrar('registro') && <Registro itens={registro} />}
        </main>
      )}
    </div>
  );
}
