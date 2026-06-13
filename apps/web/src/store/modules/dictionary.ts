import { reqGetDictionaryInfo } from '@/api/dictionary'
import { defineStore } from 'pinia'

export const useDictionary = defineStore('dictionary', {
  state: () => ({ map: new Map() }),

  actions: {
    async getDictionaryByCode(code: string) {
      if (!this.map.get(code)) {
        const { data } = await reqGetDictionaryInfo(code)

        if (data.dictionaryCode) {
          this.map.set(
            data.dictionaryCode,
            data.children?.map((child) => ({
              label: child.dictionaryLabel,
              value: child.dictionaryValue,
              disabled: child.disabled,
            })),
          )
        }
      }

      return this.map.get(code)
    },
  },
})
