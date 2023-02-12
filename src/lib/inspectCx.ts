export type ProgressInspectable = {
  // eslint-disable-next-line functional/no-return-void
  readonly onProgress?: (downloadedBytes: number) => void;
};

export type AbortInspectable = {
  readonly abortSignal?: AbortSignal;
};
