// FinFamília — Service Worker
// Estratégia: REDE PRIMEIRO. Sempre tenta buscar a versão mais nova do app.
// Só usa a cópia salva no aparelho se estiver sem internet.
// Isso evita o problema de o app "travar" numa versão antiga depois de uma atualização.

const CACHE_NAME = 'finfamilia-cache-v2';

// Assim que o novo service worker é instalado, ele assume o controle na hora,
// sem esperar todas as abas/instâncias do app fecharem.
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Ao ativar, apaga qualquer cache de versões antigas do app.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// Para cada pedido de arquivo: tenta a internet primeiro.
// Se conseguir, atualiza o cache local e entrega a versão nova.
// Se estiver offline, entrega a última versão salva localmente.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((resposta) => {
        const copia = resposta.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        return resposta;
      })
      .catch(() => caches.match(event.request))
  );
});
