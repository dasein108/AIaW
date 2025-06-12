declare module 'quasar/src/composables/private.use-field/use-field.js' {
  export function useField(state: any): any;
  export function useFieldState(options: any): any;
  export const useFieldProps: any;
  export const useFieldEmits: any;
  export function fieldValueIsFilled(value: any): boolean;
}

declare module 'quasar/src/components/input/use-mask.js' {
  export default function useMask(props: any, emit: any, emitValue: any, inputRef: any): any;
  export const useMaskProps: any;
}

declare module 'quasar/src/composables/private.use-file/use-file-dom-props.js' {
  export default function useFileFormDomProps(props: any, guard: boolean): any;
}

declare module 'quasar/src/composables/use-form/private.use-form.js' {
  export const useFormProps: any;
  export function useFormInputNameAttr(props: any): any;
}

declare module 'quasar/src/utils/event/event.js' {
  export function stop(e: Event): void;
}

declare module 'quasar/src/utils/private.create/create.js' {
  export function createComponent(options: any): any;
}

declare module 'quasar/src/utils/private.focus/focus-manager.js' {
  export function addFocusFn(fn: () => void): void;
}

declare module 'quasar/src/utils/private.inject-obj-prop/inject-obj-prop.js' {
  export function injectProp(target: any, prop: string, getter: () => any): void;
}
