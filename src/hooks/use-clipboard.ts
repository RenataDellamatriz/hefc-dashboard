import { useState } from 'react';

function useClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2500);
  };

  return { isCopied, copyToClipboard };
}

export default useClipboard;
