# vue-use-emitter
A Vue composable event emitter library based on mitt, featuring an `autoOff` method for automatic call `off` on component unmount and dependency injection for ease of use, simplifying inter-component communication with minimal code.

## Install
```bash
$ npm install @muxiu1997/vue-use-emitter
```

```js
import defineEmitterComposable from '@muxiu1997/vue-use-emitter'
```

## Usage
```typescript
// Defining an emitter composable
const useMyEmitter = defineEmitterComposable<MyEvents>({ key: 'myEmitterKey' });

// Providing an emitter at the parent component
const parentComponent = defineComponent({
  setup() {
    const myEmitter = useMyEmitter('provide');
    myEmitter.emit('myEvent', 'Hello world!');
  }
});

// Injecting an emitter in a child component
const childComponent = defineComponent({
  setup() {
    const myEmitter = defineEmitterComposable<MyEvents>({ key: 'myEmitterKey' })('inject');
    myEmitter.autoOff('myEvent', () => console.log('Event received'));
  }
});

// Using with default emitter
const useDefaultEmitter = defineEmitterComposable<MyEvents>({
  key: 'myEmitterKey',
  injectDefault: () => wrapAutoOff(mitt())
})();

// Throwing error when no provider is found
const useStrictEmitter = defineEmitterComposable<MyEvents>({
  key: 'myEmitterKey',
  throwOnNoProvider: () => new Error('Emitter not found')
})();
```

## License
[MIT](./LICENSE)
