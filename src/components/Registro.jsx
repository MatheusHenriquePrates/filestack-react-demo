export default function Registro({ itens }) {
  return (
    <section className="cartao largo">
      <h2>Registro</h2>
      {itens.length === 0 ? (
        <p className="vazio">Os eventos de envio aparecem aqui.</p>
      ) : (
        <ol className="registro" data-testid="registro">
          {itens.map((item, i) => (
            <li key={`${item.hora}-${i}`} className={item.tipo}>
              <time>{item.hora}</time>
              {item.texto}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
