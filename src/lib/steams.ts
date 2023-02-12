/* eslint-disable functional/no-return-void, functional/no-let, @typescript-eslint/no-empty-function */

/**
 * Report read bytes for a stream.
 * @param stream
 * @param onPorgress
 * @returns transformed stream
 */
export function countProgress<T extends Uint8Array>(
  stream: ReadableStream<T>,
  onPorgress: (downloadedBytes: number, ended: boolean) => void,
): ReadableStream<T> {
  let downloaded = 0;
  if (typeof TransformStream !== 'undefined') {
    return stream.pipeThrough(
      new TransformStream({
        start() {},
        transform(chunk, controller) {
          downloaded += chunk.length;
          controller.enqueue(chunk);
          onPorgress(downloaded, false);
        },
        flush() {
          onPorgress(downloaded, true);
        },
      }),
    );
  } else {
    return new ReadableStream({
      start(ctl) {
        const reader = stream.getReader();
        const step = () => {
          reader.read().then(
            ({ done, value }) => {
              if (done) {
                ctl.close();
                onPorgress(downloaded, true);
                return;
              }
              downloaded += value.length;
              ctl.enqueue(value);
              onPorgress(downloaded, false);
              step();
            },
            (reason) => {
              ctl.error(reason);
            },
          );
        };
        step();
      },
    });
  }
}
