import * as React from 'react'

const is = (x: unknown, y: unknown) =>
  (x === y && (x !== 0 || 1 / (x as number) === 1 / (y as number))) || (x !== x && y !== y)
const objectIs = typeof Object.is === 'function' ? Object.is : is

export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot: undefined | null | (() => Snapshot),
  selector: (snapshot: Snapshot) => Selection,
  isEqual?: (a: Selection, b: Selection) => boolean,
): Selection {
  const instRef = React.useRef<{
    hasValue: boolean
    value: Selection | null
  } | null>(null)
  if (instRef.current === null) {
    instRef.current = { hasValue: false, value: null }
  }

  const [getSelection, getServerSelection] = React.useMemo(() => {
    let hasMemo = false
    let memoizedSnapshot: Snapshot
    let memoizedSelection: Selection

    const memoizedSelector = (nextSnapshot: Snapshot) => {
      if (!hasMemo) {
        hasMemo = true
        memoizedSnapshot = nextSnapshot
        const nextSelection = selector(nextSnapshot)
        if (isEqual !== undefined && instRef.current!.hasValue) {
          const currentSelection = instRef.current!.value!
          if (isEqual(currentSelection, nextSelection)) {
            memoizedSelection = currentSelection
            return currentSelection
          }
        }
        memoizedSelection = nextSelection
        return nextSelection
      }

      const prevSnapshot = memoizedSnapshot
      const prevSelection = memoizedSelection

      if (objectIs(prevSnapshot, nextSnapshot)) {
        return prevSelection
      }

      const nextSelection = selector(nextSnapshot)

      if (isEqual !== undefined && isEqual(prevSelection, nextSelection)) {
        memoizedSnapshot = nextSnapshot
        return prevSelection
      }

      memoizedSnapshot = nextSnapshot
      memoizedSelection = nextSelection
      return nextSelection
    }

    const getSnapshotWithSelector = () => memoizedSelector(getSnapshot())
    const getServerSnapshotWithSelector =
      getServerSnapshot === undefined || getServerSnapshot === null
        ? undefined
        : () => memoizedSelector(getServerSnapshot())

    return [getSnapshotWithSelector, getServerSnapshotWithSelector]
  }, [getSnapshot, getServerSnapshot, selector, isEqual])

  const value = React.useSyncExternalStore(subscribe, getSelection, getServerSelection)

  React.useEffect(() => {
    instRef.current!.hasValue = true
    instRef.current!.value = value
  }, [value])

  React.useDebugValue(value)
  return value
}

export default useSyncExternalStoreWithSelector
