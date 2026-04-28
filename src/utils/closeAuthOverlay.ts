/**
 * Close auth UI whether hosted in an Ant Design Modal or the custom AuthModal overlay.
 */
export function closeAuthOverlay(): void {
  const antClose = document.querySelector(
    ".ant-modal .ant-modal-close",
  ) as HTMLElement | null;
  if (antClose) {
    antClose.click();
    return;
  }
  const backdrop = document.querySelector(
    ".modal-overlay .absolute.inset-0",
  ) as HTMLElement | null;
  if (backdrop) {
    backdrop.click();
    return;
  }
  try {
    window.history.back();
  } catch {
    /* ignore */
  }
}
