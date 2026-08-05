import { useState, useEffect, startTransition } from 'react'

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Always start with initialValue so the server-rendered HTML matches the
  // first client render — avoids the hydration mismatch caused by reading
  // localStorage in the useState initializer (which runs only on the client).
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // After hydration, sync from localStorage. Any stored value will be applied
  // on the client without touching the SSR HTML.
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) startTransition(() => setStoredValue(JSON.parse(item)))
    } catch (error) {
      console.log(error)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage
