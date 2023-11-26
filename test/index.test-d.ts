import { AutoOffEmitter } from '../src'
import { expectTypeOf } from 'vitest'
import {
  TestEvents,
  useUndefinedEmitter,
  useWithInjectDefaultEmitter,
  useWithThrowOnNoProviderEmitter,
} from './index.test'

describe.concurrent('useEmitter return correct type with different options', () => {
  test('No options - inject mode maybe return undefined', async () => {
    expectTypeOf(useUndefinedEmitter('provide')).toEqualTypeOf<AutoOffEmitter<TestEvents>>()
    expectTypeOf(useUndefinedEmitter('inject')).toEqualTypeOf<AutoOffEmitter<TestEvents> | undefined>()
  })

  test('With injects default', async () => {
    expectTypeOf(useWithInjectDefaultEmitter('provide')).toEqualTypeOf<AutoOffEmitter<TestEvents>>()
    expectTypeOf(useWithInjectDefaultEmitter('inject')).toEqualTypeOf<AutoOffEmitter<TestEvents>>()
  })

  test('With throw on no provider', async () => {
    expectTypeOf(useWithThrowOnNoProviderEmitter('provide')).toEqualTypeOf<AutoOffEmitter<TestEvents>>()
    expectTypeOf(useWithThrowOnNoProviderEmitter('inject')).toEqualTypeOf<AutoOffEmitter<TestEvents>>()
  })
})
