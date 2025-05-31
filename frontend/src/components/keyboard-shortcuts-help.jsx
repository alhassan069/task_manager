import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { keyboardShortcutsList } from './keyboard-shortcuts';

const KeyboardShortcutsHelp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  // Detect if user is on Mac
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsMac(/macintosh|mac os x/i.test(userAgent));
  }, []);

  useEffect(() => {
    const handleShowHelp = () => {
      setIsOpen(true);
    };

    document.addEventListener('keyboard:show-help', handleShowHelp);
    return () => {
      document.removeEventListener('keyboard:show-help', handleShowHelp);
    };
  }, []);

  // Function to get OS-specific key name
  const getKeyName = (key) => {
    if (key === 'Alt/Option') {
      return isMac ? 'Option' : 'Alt';
    }
    if (key === 'Ctrl') {
      return isMac ? '⌘ Cmd' : 'Ctrl';
    }
    return key;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-black/60 backdrop-blur-lg border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="space-y-3">
            {keyboardShortcutsList.map((shortcut, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-white/80">{shortcut.description}</span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      <kbd className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded border border-white/20 text-xs font-semibold">
                        {getKeyName(key)}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && <span className="text-white/60 mx-1">+</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-white/60 text-center">
            Press <kbd className="px-1 bg-white/10 rounded text-xs">{isMac ? 'Option' : 'Alt'}</kbd> + <kbd className="px-1 bg-white/10 rounded text-xs">Shift</kbd> + <kbd className="px-1 bg-white/10 rounded text-xs">H</kbd> or <kbd className="px-1 bg-white/10 rounded text-xs">{isMac ? '⌘ Cmd' : 'Ctrl'}</kbd> + <kbd className="px-1 bg-white/10 rounded text-xs">K</kbd> anytime to show this help
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { KeyboardShortcutsHelp }; 