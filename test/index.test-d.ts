import mitt from 'mitt'
import { expectTypeOf } from 'vitest'

import {
  useUndefinedEmitter,
  useWithInjectDefaultEmitter,
  useWithThrowOnNoProviderEmitter,
} from '#/index.test'
import { wrapAutoOff } from '~'

import type {
  TestEvents,
} from '#/index.test'
import type { Emitter } from 'mitt'
import type { AutoOffEmitter } from '~'

test('wrapAutoOff correct type', () => {
  expectTypeOf(wrapAutoOff(mitt<TestEvents>())).toEqualTypeOf<AutoOffEmitter<TestEvents>>()
  expectTypeOf(wrapAutoOff(mitt<TestEvents>())).toMatchTypeOf<Emitter<TestEvents>>()
  expectTypeOf(wrapAutoOff(mitt<TestEvents>())).toHaveProperty('autoOff')
  expectTypeOf(wrapAutoOff(mitt<TestEvents>()).autoOff).toEqualTypeOf<Emitter<TestEvents>['on']>()
})

describe('useEmitter return correct type with different options', () => {
  test('No options - inject mode maybe return undefined', () => {
    expectTypeOf(useUndefinedEmitter('provide')).toEqualTypeOf<AutoOffEmitter<TestEvents>>()
    expectTypeOf(useUndefinedEmitter('inject')).toEqualTypeOf<AutoOffEmitter<TestEvents> | undefined>()
  })

  test('With injects default', () => {
    expectTypeOf(useWithInjectDefaultEmitter('provide')).toEqualTypeOf<AutoOffEmitter<TestEvents>>()
    expectTypeOf(useWithInjectDefaultEmitter('inject')).toEqualTypeOf<AutoOffEmitter<TestEvents>>()
  })

  test('With throw on no provider', () => {
    expectTypeOf(useWithThrowOnNoProviderEmitter('provide')).toEqualTypeOf<AutoOffEmitter<TestEvents>>()
    expectTypeOf(useWithThrowOnNoProviderEmitter('inject')).toEqualTypeOf<AutoOffEmitter<TestEvents>>()
  })
})
