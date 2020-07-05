'use strict'

class ToolSet {
  static qFilter = (query, filters) => {
    const keys = Object.keys(filters)
    for (const key of keys) {
      if (typeof filters[key] === 'string') {
        query = query.where(key, filters[key])
      } else if (filters[key][0] && filters[key][1]) {
        query = query.whereBetween(key, filters[key])
      }
    }
    return query
  }
}

module.exports = ToolSet