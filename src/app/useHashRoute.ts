import { onBeforeUnmount, ref } from 'vue'

export interface Route {
  lab: string
  tab: string
}

/** Lê "#/lab/aba". Aceita também o formato antigo "#aba" do Laboratório Collatz. */
export function parseHash(hash: string): Route {
  const h = hash.replace(/^#/, '')
  if (!h.startsWith('/')) return h ? { lab: 'collatz', tab: h } : { lab: '', tab: '' }
  const [lab = '', tab = ''] = h.slice(1).split('/')
  return { lab, tab }
}

export const toHash = (r: Route) => (r.lab ? `#/${r.lab}${r.tab ? `/${r.tab}` : ''}` : '#/')

/**
 * Rota mínima baseada no hash. Trocar de laboratório cria entrada no histórico (o botão Voltar funciona);
 * trocar de aba só substitui a entrada atual.
 */
export function useHashRoute() {
  const route = ref<Route>(parseHash(location.hash))

  const sync = () => (route.value = parseHash(location.hash))
  window.addEventListener('hashchange', sync)
  onBeforeUnmount(() => window.removeEventListener('hashchange', sync))

  function openLab(lab: string) {
    location.hash = toHash({ lab, tab: '' })
    window.scrollTo({ top: 0 })
  }

  function setTab(tab: string) {
    route.value = { ...route.value, tab }
    history.replaceState(null, '', toHash(route.value))
  }

  return { route, openLab, setTab }
}
