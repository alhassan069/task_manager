import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ui/toast-provider';

const KeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { info } = useToast();
  const [isMac, setIsMac] = useState(false);

  // Detect if user is on Mac
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const macOS = /macintosh|mac os x/i.test(userAgent);
    setIsMac(macOS);
    console.log('Operating system detected:', macOS ? 'macOS' : 'Windows/Linux');
  }, []);

  // Show keyboard shortcuts info when component mounts
  useEffect(() => {
    // Add a small delay before showing the notification
    const timer = setTimeout(() => {
      const modifierKey = isMac ? '⌥ Option' : 'Alt';
      const ctrlKey = isMac ? '⌘ Cmd' : 'Ctrl';
      info(
        'Keyboard Shortcuts Available', 
        `Press ${modifierKey}+Shift+H or ${ctrlKey}+K to view all shortcuts`
      );
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [info, isMac]);

  useEffect(() => {
    // Map of key codes to actions
    const keyActionMap = {
      'KeyD': 'dashboard',
      'KeyN': 'new-project',
      'KeyS': 'search',
      'KeyH': 'help',
      'KeyK': 'help', // Ctrl+K will also show help
      'd': 'dashboard',
      'n': 'new-project',
      's': 'search',
      'h': 'help',
      'k': 'help', // Ctrl+K will also show help
    };

    const handleKeyDown = (e) => {
      // Log key press for debugging
      if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
        console.log('Key pressed:', {
          key: e.key,
          altKey: e.altKey,
          shiftKey: e.shiftKey,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          code: e.code
        });
      }
      
      // Check for the correct key combinations
      // 1. Alt+Shift+Key
      // 2. Ctrl+K or Cmd+K (for help)
      const isAltShiftCombo = e.altKey && e.shiftKey;
      
      // On Mac, use Command key (metaKey) as an alternative to Ctrl
      const isCtrlOrCmdK = (e.ctrlKey || (isMac && e.metaKey)) && 
                          (e.key.toLowerCase() === 'k' || e.code === 'KeyK');
      
      // If Ctrl+K or Cmd+K is pressed, show help directly
      if (isCtrlOrCmdK) {
        e.preventDefault();
        console.log('Help shortcut triggered via Ctrl/Cmd+K');
        document.dispatchEvent(new CustomEvent('keyboard:show-help'));
        return;
      }
      
      // If not Alt+Shift combo, exit
      if (!isAltShiftCombo) return;
      
      // Try to determine the action from either code or key
      const actionFromCode = keyActionMap[e.code];
      const actionFromKey = keyActionMap[e.key.toLowerCase()];
      const action = actionFromCode || actionFromKey;
      
      if (!action) return;
      
      // Prevent default for our shortcuts
      e.preventDefault();
      console.log(`${action} shortcut triggered via Alt+Shift`);
      
      switch (action) {
        case 'dashboard':
          navigate('/dashboard');
          info('Keyboard Shortcut', 'Navigated to Dashboard');
          break;
        case 'new-project':
          document.dispatchEvent(new CustomEvent('keyboard:new-project'));
          info('Keyboard Shortcut', 'New Project shortcut triggered');
          break;
        case 'search':
          document.dispatchEvent(new CustomEvent('keyboard:focus-search'));
          info('Keyboard Shortcut', 'Search focused');
          break;
        case 'help':
          document.dispatchEvent(new CustomEvent('keyboard:show-help'));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, info, isMac]);

  // This is a non-rendering component
  return null;
};

export { KeyboardShortcuts };

// Help modal content - can be used elsewhere
export const keyboardShortcutsList = [
  { keys: ['Alt/Option', 'Shift', 'D'], description: 'Go to Dashboard' },
  { keys: ['Alt/Option', 'Shift', 'N'], description: 'Create new project' },
  { keys: ['Alt/Option', 'Shift', 'S'], description: 'Focus search' },
  { keys: ['Alt/Option', 'Shift', 'H'], description: 'Show keyboard shortcuts' },
  { keys: ['Ctrl', 'K'], description: 'Show keyboard shortcuts (alternative)' },
]; 