/**
 * Полифилл для @radix-ui/react-slot
 * 
 * Этот файл создает полифилл для @radix-ui/react-slot,
 * который может вызывать проблемы в Expo
 */

import React from 'react';

// Простая реализация Slot компонента
export const Slot = React.forwardRef(({ children, ...props }, forwardedRef) => {
  if (!React.isValidElement(children)) {
    return null;
  }

  return React.cloneElement(children, {
    ...props,
    ...children.props,
    ref: forwardedRef
      ? (node) => {
          if (typeof children.ref === 'function') children.ref(node);
          forwardedRef(node);
        }
      : children.ref,
  });
});

Slot.displayName = 'Slot';

// Сохраняем Slot в глобальном объекте для использования в других модулях
if (typeof global.__RADIX_UI_MODULES__ === 'undefined') {
  global.__RADIX_UI_MODULES__ = {};
}
global.__RADIX_UI_MODULES__.Slot = Slot; 