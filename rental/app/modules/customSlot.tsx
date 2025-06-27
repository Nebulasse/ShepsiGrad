/**
 * Собственная реализация Slot компонента
 * 
 * Этот файл создает собственную реализацию компонента Slot,
 * который используется в expo-router
 */

import React from 'react';

// Типы для Slot компонента
interface SlotProps {
  children: React.ReactNode;
  [key: string]: any;
}

// Реализация Slot компонента
export const Slot = React.forwardRef<unknown, SlotProps>((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  
  // Если children не является валидным React элементом, возвращаем null
  if (!React.isValidElement(children)) {
    return null;
  }

  // Клонируем элемент с новыми пропсами
  return React.cloneElement(children, {
    ...slotProps,
    ...children.props,
    ref: forwardedRef
      ? (node: unknown) => {
          // Передаем ref в оба места
          if (typeof children.ref === 'function') {
            (children.ref as Function)(node);
          } else if (children.ref) {
            (children.ref as React.MutableRefObject<unknown>).current = node;
          }
          
          // Передаем ref в родительский компонент
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else if (forwardedRef) {
            (forwardedRef as React.MutableRefObject<unknown>).current = node;
          }
        }
      : children.ref,
  });
});

Slot.displayName = 'Slot'; 