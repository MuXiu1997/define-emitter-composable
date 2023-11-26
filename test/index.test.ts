import { describe, test, expect, vi } from 'vitest'
import defineEmitterComposable, { AutoOffEmitter, UseEmitter, wrapAutoOff } from '../src/index'
import mitt from 'mitt'
import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'

export type TestEvents = { foo: string; bar: number }

export const NoProviderError = new Error('No provider')

export const optionWithInjectDefault = { injectDefault: () => wrapAutoOff(mitt<TestEvents>()) }
export const optionWithThrowOnNoProvider = { throwOnNoProvider: () => NoProviderError }

export const useUndefinedEmitter = defineEmitterComposable<TestEvents>()
export const useWithInjectDefaultEmitter = defineEmitterComposable<TestEvents>(optionWithInjectDefault)
export const useWithThrowOnNoProviderEmitter = defineEmitterComposable<TestEvents>(optionWithThrowOnNoProvider)

test('wrapAutoOff correct behavior', () => {
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
    return [ParentComponent, ChildComponent]
  }
  // endregion Define Components

  test('No options - inject mode return undefined', async () => {
    const [ParentComponent, ChildComponent] = createComponent(useUndefinedEmitter)
    const wrapper = mount(ParentComponent)
    // @ts-ignore
    const emitter = wrapper.getComponent(ChildComponent).vm.emitter
    expect(emitter).toBeUndefined()
  })

  test('With injects default - inject mode return default', async () => {
    const spy = vi.spyOn(optionWithInjectDefault, 'injectDefault')
    const [ParentComponent, ChildComponent] = createComponent(useWithInjectDefaultEmitter)
    const wrapper = mount(ParentComponent)
    // @ts-ignore
    const emitter = wrapper.getComponent(ChildComponent).vm.emitter
    expect(emitter).toStrictEqual(spy.mock.results[0].value)
    spy.mockRestore()
  })

  test('With throw on no provider - inject mode throw error', async () => {
    const [ParentComponent, _] = createComponent(useWithThrowOnNoProviderEmitter)
    expect(() => mount(ParentComponent)).toThrow(NoProviderError)
  })
})

// @vitest-environment jsdom
describe('Emitter autoOff correct behavior', async () => {
  const strOn = ref<string | undefined>(undefined)
  const strAutoOff = ref<string | undefined>(undefined)

  // region Define Components
  function createComponent<UE extends UseEmitter<AutoOffEmitter<TestEvents> | undefined>>(useEmitter: UE) {
    const ChildComponent = defineComponent({
      setup(_, ctx) {
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

  test('The initial state of `strOn` and `strAutoOff` should be undefined', async () => {
    expect(strOn.value).toBeUndefined()
    expect(strAutoOff.value).toBeUndefined()
  })

  test('Emitting `foo` event updates `strOn` and `strAutoOff`', async () => {
    emitter.emit('foo', 'hello world')
    expect(strOn.value).eq('hello world')
    expect(strAutoOff.value).eq('hello world')
  })

  test('Emitting `foo` event after unmounting ChildComponent does not update `strAutoOff`, but it updates `strOn`', async () => {
    wrapper.vm.mountChild = false
    await wrapper.vm.$nextTick()
    emitter.emit('foo', 'hello world again')
    expect(strOn.value).eq('hello world again')
    expect(strAutoOff.value).eq('hello world')
  })
})
