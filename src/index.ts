import mitt, { Emitter, EventType } from 'mitt'
import { InjectionKey, provide, inject } from 'vue-demi'

export type WithInjectDefault<Events extends Record<EventType, unknown>> = {
  injectDefault: Emitter<Events> | (() => Emitter<Events>)
}

export type WithThrowOnNoProvider = {
  throwOnNoProvider: () => Error
}

export type Options<Events extends Record<EventType, unknown>> = {
  key?: InjectionKey<Emitter<Events>> | string
} & (WithInjectDefault<Events> | WithThrowOnNoProvider)

export type ComposableMode = 'inject' | 'provide'

/**
 * Creates a Vue composable function for providing or injecting a mitt event emitter.
 *
 * @template Events - The mitt events.
 *
 * @param [options] - Optional configuration options.
 * @param {InjectionKey<Emitter<Events>> | string} [options.key] - The injection key to use for providing or injecting the event emitter.
 * @param {Emitter<Events> | (() => Emitter<Events>)} [options.injectDefault] - The default event emitter to inject if no provider is found.
 * @param {() => Error} [options.throwOnNoProvider] - A function that throws an error if no provider is found.
 * @returns {(mode?: ComposableMode) => Emitter<Events>} - A composable function that can be used to provide or inject an event emitter based on the mode.
 *
 * @example
 * // Creates a composable function for providing or injecting a mitt event emitter.
 * const useFooEmitter = defineEmitterComposable<{ bar: string, baz: number }>({ key: Symbol('bar') , throwOnNoProvider: () => new Error('No provider for bar') })
 * const useBarEmitter = defineEmitterComposable()
 *
 * // In a Vue component setup
 * setup() {
 *   const fooEmitter = useFooEmitter('provide') // Provides an emitter
 *   fooEmitter.on('bar', (payload) => {
 *     // Handle the event
 *   })
 *
 *   // Or inject an existing event emitter
 *   const injectedBarEmitter = useFooEmitter() // Or `useFooEmitter('inject')`
 *   injectedFooEmitter.emit('bar', 'bar')
 *   injectedFooEmitter.emit('baz', 123)
 *
 *   // If `injectDefault` or `throwOnNoProvider` options are not set, the return value may be undefined
 *   const undefinedEmitter = useBarEmitter() // undefined
 * }
 */
export default function defineEmitterComposable<Events extends Record<EventType, unknown>>(
  options: Options<Events>,
): (mode?: ComposableMode) => Emitter<Events>

/**
 * Creates a Vue composable function for providing or injecting a mitt event emitter.
 *
 * @template Events - The mitt events.
 *
 * @param [options] - Optional configuration options.
 * @param {InjectionKey<Emitter<Events>> | string} [options.key] - The injection key to use for providing or injecting the event emitter.
 * @returns {(mode?: ComposableMode) => Emitter<Events> | undefined} - A composable function that can be used to provide or inject an event emitter based on the mode.
 *
 * @example
 * // Creates a composable function for providing or injecting a mitt event emitter.
 * const useFooEmitter = defineEmitterComposable<{ bar: string, baz: number }>({ key: Symbol('bar') , throwOnNoProvider: () => new Error('No provider for bar') })
 * const useBarEmitter = defineEmitterComposable()
 *
 * // In a Vue component setup
 * setup() {
 *   const fooEmitter = useFooEmitter('provide') // Provides an emitter
 *   fooEmitter.on('bar', (payload) => {
 *     // Handle the event
 *   })
 *
 *   // Or inject an existing event emitter
 *   const injectedBarEmitter = useFooEmitter() // Or `useFooEmitter('inject')`
 *   injectedFooEmitter.emit('bar', 'bar')
 *   injectedFooEmitter.emit('baz', 123)
 *
 *   // If `injectDefault` or `throwOnNoProvider` options are not set, the return value may be undefined
 *   const undefinedEmitter = useBarEmitter() // undefined
 * }
 */
export default function defineEmitterComposable<Events extends Record<EventType, unknown>>(
  options?: Pick<Options<Events>, 'key'>,
): (mode?: ComposableMode) => Emitter<Events> | undefined

export default function defineEmitterComposable<Events extends Record<EventType, unknown>>(
  options: Partial<Options<Events>> = {},
): (mode?: ComposableMode) => Emitter<Events> | undefined {
  const injectKey = options.key ?? (Symbol() as InjectionKey<Emitter<Events>>)
  return (mode: ComposableMode = 'inject') => {
    if (mode === 'provide') {
      const emitter: Emitter<Events> = mitt()
      provide(injectKey, emitter)
      return emitter
    }

    if ('injectDefault' in options && options.injectDefault != null)
      return inject(injectKey, options.injectDefault, true)

    const emitter = inject(injectKey)
    if (emitter == null && 'throwOnNoProvider' in options && options.throwOnNoProvider != null)
      throw options.throwOnNoProvider()
    return emitter
  }
}
