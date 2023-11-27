import { mount } from '@vue/test-utils'
import mitt from 'mitt'
import { describe, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'

import defineEmitterComposable, { wrapAutoOff } from '~'

import type { EventType } from 'mitt'
import type { AutoOffEmitter, UseEmitter } from '~'

export interface TestEvents extends Record<EventType, unknown> {
  foo: string
  bar: number
}

export const NoProviderError = new Error('No provider')

export const optionWithInjectDefault = { injectDefault: () => wrapAutoOff(mitt<TestEvents>()) }
export const optionWithThrowOnNoProvider = { throwOnNoProvider: () => NoProviderError }

export const useUndefinedEmitter = defineEmitterComposable<TestEvents>()
export const useWithInjectDefaultEmitter = defineEmitterComposable<TestEvents>(optionWithInjectDefault)
export const useWithThrowOnNoProviderEmitter = defineEmitterComposable<TestEvents>(optionWithThrowOnNoProvider)

it('wrapAutoOff correct behavior', ({ expect }) => {
  const emitter = wrapAutoOff(mitt<TestEvents>())
  expect(emitter).toHaveProperty('autoOff')
})

describe.concurrent(`useEmitter('inject') correct behavior with no provider`, () => {
  // region Define Components
  function createComponent<UE extends UseEmitter<AutoOffEmitter<TestEvents> | undefined>>(useEmitter: UE) {
    const ChildComponent = defineComponent({
      setup() {
        const emitter = useEmitter()
        return {
          emitter,
        }
      },
      render() {
        return null
      },
    })

    const ParentComponent = defineComponent({
      components: {
        ChildComponent,
      },
      setup() {},
      template: `
        <div>
          <child-component />
        </div>
      `,
    })
    return [ParentComponent, ChildComponent] as const
  }
  // endregion Define Components

  it('no options - inject mode return undefined', async ({ expect }) => {
    const [ParentComponent, ChildComponent] = createComponent(useUndefinedEmitter)
    const wrapper = mount(ParentComponent)
    const emitter = wrapper.getComponent(ChildComponent).vm.emitter
    expect(emitter).toBeUndefined()
  })

  it('with injects default - inject mode return default', async ({ expect }) => {
    const spy = vi.spyOn(optionWithInjectDefault, 'injectDefault')
    const [ParentComponent, ChildComponent] = createComponent(useWithInjectDefaultEmitter)
    const wrapper = mount(ParentComponent)
    const emitter = wrapper.getComponent(ChildComponent).vm.emitter
    expect(emitter).toStrictEqual(spy.mock.results[0].value)
    spy.mockRestore()
  })

  it('with throw on no provider - inject mode throw error', async ({ expect }) => {
    const [ParentComponent, _] = createComponent(useWithThrowOnNoProviderEmitter)
    expect(() => mount(ParentComponent)).toThrow(NoProviderError)
  })
})

// @vitest-environment jsdom
describe.sequential('emitter autoOff correct behavior', async () => {
  const strOn = ref<string | undefined>(undefined)
  const strAutoOff = ref<string | undefined>(undefined)

  // region Define Components
  function createComponent<UE extends UseEmitter<AutoOffEmitter<TestEvents> | undefined>>(useEmitter: UE) {
    const ChildComponent = defineComponent({
      setup(_) {
        const emitter = useEmitter()
        emitter?.on('foo', (payload) => {
          strOn.value = payload
        })
        emitter?.autoOff('foo', (payload) => {
          strAutoOff.value = payload
        })
      },
      render() {
        return null
      },
    })

    return defineComponent({
      components: {
        ChildComponent,
      },
      setup() {
        const emitter = useEmitter('provide')
        const mountChild = ref(true)
        return {
          emitter,
          mountChild,
        }
      },
      template: `
        <div>
          <child-component v-if='mountChild' />
        </div>
      `,
    })
  }

  // endregion Define Components

  const wrapper = mount(createComponent(useUndefinedEmitter))
  const emitter = wrapper.vm.emitter

  it('the initial state of `strOn` and `strAutoOff` should be undefined', async ({ expect }) => {
    expect(strOn.value).toBeUndefined()
    expect(strAutoOff.value).toBeUndefined()
  })

  it('emitting `foo` event updates `strOn` and `strAutoOff`', async ({ expect }) => {
    emitter.emit('foo', 'hello world')
    expect(strOn.value).eq('hello world')
    expect(strAutoOff.value).eq('hello world')
  })

  it('emitting `foo` event after unmounting ChildComponent does not update `strAutoOff`, but it updates `strOn`', async ({ expect }) => {
    wrapper.vm.mountChild = false
    await wrapper.vm.$nextTick()
    emitter.emit('foo', 'hello world again')
    expect(strOn.value).eq('hello world again')
    expect(strAutoOff.value).eq('hello world')
  })
})
