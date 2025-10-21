// frontend/src/components/SearchBar.jsx
import { useEffect, useMemo, useRef, useState } from 'react';

export default function SearchBar({
  value = '',
  onChange,
  onSearch,
  onClear,
  autoFocus = false,
  debounceMs = 0, // ตั้ง >0 ถ้าอยากดีบาวน์การพิมพ์ก่อนแจ้ง onChange
  placeholder = 'ค้นหาร้านอาหาร...',
}) {
  const inputRef = useRef(null);
  const [internal, setInternal] = useState(value ?? '');

  // sync external value -> internal
  useEffect(() => { setInternal(value ?? ''); }, [value]);

  // debounce onChange (ถ้ากำหนด debounceMs)
  useEffect(() => {
    if (!onChange) return;
    if (!debounceMs) { onChange(internal); return; }
    const t = setTimeout(() => onChange(internal), debounceMs);
    return () => clearTimeout(t);
  }, [internal, onChange, debounceMs]);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  // Global shortcut: Ctrl/Cmd + K เพื่อโฟกัสช่องค้นหา
  useEffect(() => {
    const handler = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(internal.trim());
  };

  const clear = () => {
    setInternal('');
    onClear?.();
    // ถ้าไม่มี debounce, แจ้ง onChange('') ทันที (ทำไปแล้วใน effect ข้างบน)
    if (!debounceMs && onChange) onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (internal) clear();
    }
  };

  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          autoComplete="off"
          aria-label="ช่องค้นหาร้านอาหาร"
          placeholder={placeholder}
          value={internal}
          onChange={(e) => setInternal(e.target.value)}
          onKeyDown={handleKeyDown}
          className="search-input"
        />
        {internal && (
          <button
            type="button"
            onClick={clear}
            className="clear-button"
            aria-label="ล้างคำค้นหา"
            title="ล้าง (Esc)"
          >
            ✕
          </button>
        )}
      </div>

      <button type="submit" className="search-button" aria-label="ค้นหา">
        🔍 ค้นหา
      </button>
    </form>
  );
}