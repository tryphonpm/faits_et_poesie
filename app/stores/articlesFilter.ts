/** Filtre bulletin sur la page liste des articles ('' = sans bulletin). */
export const useArticlesFilterStore = defineStore('articlesFilter', {
  state: () => ({
    filterKey: ''
  }),
  actions: {
    setFilterKey(key: string) {
      this.filterKey = key
    }
  }
})
