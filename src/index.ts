import defineUseDependencyInjection from '@muxiu1997/vue-easy-di'
import mitt from 'mitt'
import { getCurrentInstance, onUnmounted } from 'vue-demi'

import type { Options as DIOptions, UseInitiatedDependencyInjection } from '@muxiu1997/vue-easy-di'
import type { Emitter, EventType, Handler, WildcardHandler } from 'mitt'

export type Options<Events extends Record<EventType, unknown>> = DIOptions<AutoOffEmitter<Events>>

/**
 * Extends the Emitter interface to include an `autoOff` method.
 * This method allows for automatic unsubscription from events when the Vue component is unmounted.
 */
export interface AutoOffEmitter<Events extends Record<EventType, unknown>> extends Emitter<Events> {
  autoOff<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void

  autoOff(type: '*', handler: WildcardHandler<Events>): void
}

/**
 * Wraps a given emitter with additional functionality, enabling the `autoOff` method.
 * This method allows for automatic unsubscription from events when the Vue component is unmounted.
 */
export function wrapAutoOff<Events extends Record<EventType, unknown>>(
  emitter: Emitter<Events>,
): AutoOffEmitter<Events> {
  type GenericEventHandler = Handler<Events[keyof Events]> | WildcardHandler<Events>
  return Object.assign(emitter, {
    autoOff<Key extends keyof Events>(type: Key, handler: GenericEventHandler) {
      /* @ts-expect-error - they are handled at runtime */
      emitter.on(type, handler)
      if (getCurrentInstance()) {
        onUnmounted(() => {
          /* @ts-expect-error - they are handled at runtime */
          emitter.off(type, handler)
        })
      }
    },
  })
}

/**
 * A composable for using the AutoOffEmitter in a Vue component. It can be used in 'inject' or 'provide' mode.
 */
export type UseEmitter<EE extends AutoOffEmitter<any> | undefined> = UseInitiatedDependencyInjection<EE>

/**
 * Defines a composable for Vue that provides or injects an event emitter.
 *
 * @param options - Configuration options for the composable.
 * @param options.key - An optional InjectionKey or string to uniquely identify the emitter in the Vue application's dependency injection system.
 * @param options.injectDefault - An optional default emitter to be used when none is provided. Can be either an instance of AutoOffEmitter or a factory function returning one.
 * @param options.throwOnNoProvider - An optional function that returns an error to be thrown when no emitter is provided, and no default is specified.
 *
 * @returns A UseEmitter function that can be called with 'provide' or 'inject' to either provide a new AutoOffEmitter instance to the Vue component tree, or inject an existing one from a parent component. If neither 'provide' nor 'inject' is specified, it defaults to 'inject'.
 *
 * @example
 * // Defining an emitter composable
 * const useMyEmitter = defineEmitterComposable<MyEvents>({ key: 'myEmitterKey' });
 *
 * // Providing an emitter at the parent component
 * const parentComponent = defineComponent({
 *   setup() {
 *     const myEmitter = useMyEmitter('provide');
 *     myEmitter.emit('myEvent', 'Hello world!');
 *   }
 * });
 *
 * // Injecting an emitter in a child component
 * const childComponent = defineComponent({
 *   setup() {
 *     const myEmitter = defineEmitterComposable<MyEvents>({ key: 'myEmitterKey' })('inject');
 *     myEmitter.autoOff('myEvent', () => console.log('Event received'));
 *   }
 * });
 *
 * // Using with default emitter
 * const useDefaultEmitter = defineEmitterComposable<MyEvents>({
 *   key: 'myEmitterKey',
 *   injectDefault: () => wrapAutoOff(mitt())
 * })();
 *
 * // Throwing error when no provider is found
 * const useStrictEmitter = defineEmitterComposable<MyEvents>({
 *   key: 'myEmitterKey',
 *   throwOnNoProvider: () => new Error('Emitter not found')
 * })();
 */
export default function defineEmitterComposable<Events extends Record<EventType, unknown>>(
  options: Options<Events>,
): UseEmitter<AutoOffEmitter<Events>>

/**
 * Defines a composable for Vue that provides or injects an event emitter.
 *
 * @param options - Configuration options for the composable.
 * @param options.key - An optional InjectionKey or string to uniquely identify the emitter in the Vue application's dependency injection system.
 * @param options.injectDefault - An optional default emitter to be used when none is provided. Can be either an instance of AutoOffEmitter or a factory function returning one.
 * @param options.throwOnNoProvider - An optional function that returns an error to be thrown when no emitter is provided, and no default is specified.
 *
 * @returns A UseEmitter function that can be called with 'provide' or 'inject' to either provide a new AutoOffEmitter instance to the Vue component tree, or inject an existing one from a parent component. If neither 'provide' nor 'inject' is specified, it defaults to 'inject'.
 *
 * @example
 * // Defining an emitter composable
 * const useMyEmitter = defineEmitterComposable<MyEvents>({ key: 'myEmitterKey' });
 *
 * // Providing an emitter at the parent component
 * const parentComponent = defineComponent({
 *   setup() {
 *     const myEmitter = useMyEmitter('provide');
 *     myEmitter.emit('myEvent', 'Hello world!');
 *   }
 * });
 *
 * // Injecting an emitter in a child component
 * const childComponent = defineComponent({
 *   setup() {
 *     const myEmitter = defineEmitterComposable<MyEvents>({ key: 'myEmitterKey' })('inject');
 *     myEmitter.autoOff('myEvent', () => console.log('Event received'));
 *   }
 * });
 *
 * // Using with default emitter
 * const useDefaultEmitter = defineEmitterComposable<MyEvents>({
 *   key: 'myEmitterKey',
 *   injectDefault: () => wrapAutoOff(mitt())
 * })();
 *
 * // Throwing error when no provider is found
 * const useStrictEmitter = defineEmitterComposable<MyEvents>({
 *   key: 'myEmitterKey',
 *   throwOnNoProvider: () => new Error('Emitter not found')
 * })();
 */
export default function defineEmitterComposable<Events extends Record<EventType, unknown>>(
  options?: Pick<Options<Events>, 'key'>,
): UseEmitter<AutoOffEmitter<Events> | undefined>

export default function defineEmitterComposable<Events extends Record<EventType, unknown>>(
  options: Partial<Options<Events>> = {},
): UseEmitter<AutoOffEmitter<Events> | undefined> | UseEmitter<AutoOffEmitter<Events>> {
  if (options.key == null) options.key = Symbol('vue-use-emitter')
  return defineUseDependencyInjection(
    () => wrapAutoOff(mitt()),
    options,
  )
}
