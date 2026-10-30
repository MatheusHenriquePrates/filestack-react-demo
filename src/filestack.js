// Configuração compartilhada do Filestack e pequenos utilitários de exibição.
export const KEY = import.meta.env.VITE_FILESTACK_KEY ?? '';

const CDN = 'https://cdn.filestackcontent.com';

// Fontes oferecidas na janela de envio. As de nuvem pedem login na conta do próprio usuário.
export const FONTES = ['local_file_system', 'url', 'webcam', 'googledrive', 'dropbox', 'imagesearch', 'unsplash'];

export const NOMES_FONTES = {
  local_file_system: 'Computador',
  url: 'Link',
  webcam: 'Câmera',
  googledrive: 'Google Drive',
  dropbox: 'Dropbox',
  imagesearch: 'Busca de imagens',
  unsplash: 'Unsplash',
  sdk: 'Código (SDK)',
};

// Transformação pelo link do CDN: https://cdn.filestackcontent.com/<tarefa>/<handle>
export const linkTransformado = (handle, tarefa) => `${CDN}/${tarefa}/${handle}`;

export const tamanho = (bytes) => {
  if (bytes == null) return '—';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

export const ehImagem = (arquivo) => arquivo.mimetype?.startsWith('image/');
