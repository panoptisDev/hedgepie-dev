type Mouseflow = {
  getSessionId: () => string,
}

type MouseflowCommandKey = 'tag' | 'identify' | 'setVariable'

export type MouseflowCommand = ((mf: Mouseflow) => void) |
  [MouseflowCommandKey, ...string[]]

const useMouseflow = (): MouseflowCommand[]  => {
  (window as Window & typeof globalThis & {
    _mfq: MouseflowCommand[]
  })._mfq = (window as Window & typeof globalThis & {
    _mfq: MouseflowCommand[]
  })._mfq || [];

  const mouseflow = (window as Window & typeof globalThis & {
    _mfq: MouseflowCommand[]
  })._mfq;

  return mouseflow;
};

export default useMouseflow;

