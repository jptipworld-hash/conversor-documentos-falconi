
declare module 'pptx2json' {
  function pptx2json(
    filePath: string, 
    callback: (err: Error | null, data: any) => void
  ): void;
  export = pptx2json;
}
