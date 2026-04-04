type ExportFormat = 'pdf' | 'pptx' | 'gslides'

type ExportOptions = {
  format: ExportFormat
}

type SlidenerdsApi = {
  export: (options: ExportOptions) => Promise<void>
}

declare global {
  interface Window {
    slidenerds: SlidenerdsApi
  }
}

export const registerExportApi = (): void => {
  if (typeof window === 'undefined') return

  window.slidenerds = {
    export: async (options: ExportOptions) => {
      const { format } = options
      switch (format) {
        case 'pdf':
          window.print()
          break
        case 'pptx':
          console.info('[slidenerds] PPTX export triggered. Use the CLI for full export.')
          break
        case 'gslides':
          console.info(
            '[slidenerds] Google Slides export triggered. Use the CLI for full export.',
          )
          break
      }
    },
  }
}
