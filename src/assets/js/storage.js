'use strict'
import storejs from 'storejs'

let domain = 'saas'
domain += '_'
domain = ''
const storage = {
  set (key, value) {
    storejs.set(domain + key, value)
  },
  get (key) {
    return storejs.get(domain + key)
  },
  remove (key) {
    storejs.remove(domain + key)
  },
  removes (keys) {
    for (let i = 0; i < keys.length; i++) {
      storejs.remove(domain + key)
    }
  },
  clear () {
    storejs.clear()
  }
}

export default {
  clear () {
    storage.removes(['TOKEN'])
  },

  token (value) {
    if (value) storage.set('TOKEN', value)
    else return storage.get('TOKEN')
  }
}
