# define-emitter-composable
Creates a Vue composable function for providing or injecting a mitt event emitter.

## Install
```bash
$ npm install define-emitter-composable
```

```js
import defineEmitterComposable from 'define-emitter-composable'
```

## Usage
```js
// Creates a composable function for providing or injecting a mitt event emitter.
const useFooEmitter = defineEmitterComposable<{ bar: string, baz: number }>({ key: Symbol('bar') , throwOnNoProvider: () => new Error('No provider for bar') })
const useBarEmitter = defineEmitterComposable()
                                                                                                                                                               
// In a Vue component setup
setup() {
  const fooEmitter = useFooEmitter('provide') // Provides an emitter
  fooEmitter.on('bar', (payload) => {
    // Handle the event
  })
                                                                                                                                                               
  // Or inject an existing event emitter
  const injectedBarEmitter = useFooEmitter() // Or `useFooEmitter('inject')`
  injectedFooEmitter.emit('bar', 'bar')
  injectedFooEmitter.emit('baz', 123)
                                                                                                                                                               
  // If `injectDefault` or `throwOnNoProvider` options are not set, the return value may be undefined
  const undefinedEmitter = useBarEmitter() // undefined
}
```

## License
[MIT](./LICENSE)
