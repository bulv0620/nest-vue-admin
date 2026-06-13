export function hasDuplicateField(items: any[], fieldName: string) {
  const seen = new Set()

  for (const item of items) {
    const fieldValue = item[fieldName]
    if (seen.has(fieldValue)) {
      return true // 找到了重复
    }
    seen.add(fieldValue)
  }

  return false // 没有重复
}

export function groupByFirst(array: any[], key: string) {
  return array.reduce((result, currentValue) => {
    if (!result[currentValue[key]]) {
      result[currentValue[key]] = currentValue
    }

    return result
  }, {})
}

export function groupBy(array: any[], key: string) {
  return array.reduce((result, currentValue) => {
    result[currentValue[key]] = result[currentValue[key]] || []

    result[currentValue[key]].push(currentValue)

    return result
  }, {})
}
