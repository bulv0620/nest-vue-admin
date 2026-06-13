type DeepClone<T> = {
  [P in keyof T]: T[P] extends object ? DeepClone<T[P]> : T[P]
}

export function deepClone<T>(source: T): DeepClone<T> {
  if (typeof source !== 'object' || source === null) {
    return source as DeepClone<T>
  }

  if (Array.isArray(source)) {
    return source.map((item) => deepClone(item)) as unknown as DeepClone<T>
  }

  const target = {} as DeepClone<T>

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = deepClone(source[key])
    }
  }

  return target
}
