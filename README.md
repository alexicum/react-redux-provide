# react-redux-provide

[![build status](https://img.shields.io/travis/loggur/react-redux-provide/master.svg?style=flat-square)](https://travis-ci.org/loggur/react-redux-provide) [![npm version](https://img.shields.io/npm/v/react-redux-provide.svg?style=flat-square)](https://www.npmjs.com/package/react-redux-provide)
[![npm downloads](https://img.shields.io/npm/dm/react-redux-provide.svg?style=flat-square)](https://www.npmjs.com/package/react-redux-provide)


This small library allows you to:

1. Build your entire app's view layer first - i.e., all your components become as "dumb" as possible.

2. Decorate your components with `@provide`, which allows you to specify - as `propTypes` - exactly the data and actions said components need.

3. When mounting your app, assign providers to your components as necessary.


## Pros

- Maximum separation of concerns.
- Use packaged providers for common use-cases or even build apps around specific providers.
- Quickly and easily switch out one provider for another.
- Enforces clean and efficient design.
- Extremely predictable and easy to understand.
- Reduces boilerplate.
- **No need for `context` (i.e, `react-redux`'s `<Provider>` component)!**
- Looks good in [`react-devtools`](https://github.com/facebook/react-devtools)!

![See `ProvideBranches(theme,packageList,sources)`](https://cloud.githubusercontent.com/assets/7020411/9288123/3587858e-4305-11e5-8156-fe0392e6f7fd.png)


## Cons

- You tell me!


## Installation

```
npm install react-redux-provide --save
```


## Usage

The API surface area is [naturally tiny](https://github.com/loggur/react-redux-provide/blob/master/src/index.js).  You typically only need to concern yourself with the two main exports:

1.  `provide` - The decorator which allows you to assign providers to components.

2.  `assignProviders (Optional Object initialState, Object providers, Object components)` - Assigns providers to components of course!  Optionally initialize the store's state.  Check [the source](https://github.com/loggur/react-redux-provide/blob/master/src/assignProviders.js) for exact usage.

And the following utilities:

1.  `addMiddleware (Object providers, Array|Function middleware)` - Adds middleware(s) to each provider.

2.  `addEnhancer (Object providers, Array|Function enhancer)` - Adds enhancer(s) to each provider.

3.  `createProviderStore (Object provider, Optional Object initialState)` - Creates and returns a store specifically for some provider.

4.  `shareStore (Object providers, Optional Object initialState)` - Creates and returns a shared store based on the combination of each provider and assigns it to them.


## Caveats

1.  Components can have multiple providers, but the provided `props` (`actions` and `reducers`) should be unique to each provider.

2.  When assigning a provider to components, it will automatically create a new store for you if you haven't explicitly included a `store` key within your `provider` object.  Said store is shared throughout the components passed to `assignProviders`.  You can of course call `assignProviders` multiple times to create multiple stores as necessary.


## Quick Example

Basically, create some component with only the view in mind, plus whatever `props` you'd expect to use for triggering actions.  For this quick example, we know [`react-redux-provide-list`](https://github.com/loggur/react-redux-provide-list) provides a `list` prop and a `pushItem` function, so in our `@provide` decorator we'll make it clear that's what we want.

From [examples/good-times/components/GoodTimes.js](https://github.com/loggur/react-redux-provide/blob/master/examples/good-times/components/GoodTimes.js):
```js
import React, { Component, PropTypes } from 'react';
import provide from 'react-redux-provide';

@provide
export default class GoodTimes extends Component {
  static propTypes = {
    list: PropTypes.arrayOf(PropTypes.object).isRequired,
    pushItem: PropTypes.func.isRequired
  };

  addTime() {
    this.props.pushItem({
      time: Date.now()
    });
  }

  render() {
    return (
      <div className="good-times">
        {this.renderButton()}
        {this.renderTimes()}
      </div>
    );
  }

  renderButton() {
    const style = {
      fontSize: '20px',
      marginBottom: '20px'
    };
    
    return (
      <input
        type="button"
        style={style}
        value="Let the good times roll"
        onClick={::this.addTime}
      />
    );
  }

  renderTimes() {
    return this.props.list.map(
      item => (
        <li key={item.time}>
          {new Date(item.time).toString()}
        </li>
      )
    );
  }
}
```

Then when mounting the app, all we need to do is assign the provider(s) to the component(s).  Let's create a file called [`init.js`](https://github.com/loggur/react-redux-provide/blob/master/examples/good-times/init.js) to do this:

```js
import { assignProviders } from 'react-redux-provide';
import provideList from 'react-redux-provide-list';
import GoodTimes from './components/GoodTimes';

const list = provideList();

const initialState = {
  list: [
    { time: Date.now() }
  ]
};

assignProviders(initialState, { list }, {
  GoodTimes
});
```

And last but not least, all we have to do is import `init.js` when rendering the app.  From [`index.js`](https://github.com/loggur/react-redux-provide/blob/master/examples/good-times/index.js):

```js
import './init';
import React from 'react';
import { render } from 'react-dom';
import GoodTimes from './components/GoodTimes';

render(<GoodTimes/>, document.getElementById('root'));
```


## Creating Providers

A provider is just an object with a few properties.  At its core, it's your usual [`redux`](https://github.com/rackt/redux) `actions` and `reducers`, which you'll typically need at a bare minimum.  There are a few other things you can optionally include:

- `name` - Defaults to its corresponding key within the `providers` argument of your `assignProviders` call.  This will show up in [`react-devtools`](https://github.com/facebook/react-devtools) - e.g., if you provide `list` and `map` to `SomeComponent`, in your dev tools, you'll see `SomeComponent` wrapped with another component called `ProvideSomeComponent(list,map)`.

- `middleware` - Include whatever middleware is used by your provider.  This can be either an array of middlewares or a single middleware.

- `enhancer` - Include whatever enhancer is used by your provider's store.  This can be either an array of enhancers or a single enhancer.

- `merge(stateProps, dispatchProps, parentProps)` - This incredibly useful function should return an object, which typically adds, removes, or replaces certain provided properties based on whatever logic you deem necessary.  For example, in [`react-redux-provide-list`](https://github.com/loggur/react-redux-provide-list), if the component has an `index` prop passed to its parent and expects an `item` prop from the provider, the `merge` function will attempt to provide the `item` at that `index` within the `list` to the component.

- `store` - This is your typical `redux` store.  See the Caveats section above about automatically generated stores.  

- `mapState` - Maps each reduced state to the provided `props`.  By default, it will map them all.  It's unlikely that you'll ever actually need to include this.

- `mapDispatch` - It's unlikely that you'll need to include this as well.  This defaults to `dispatch => bindActionCreators(actions, dispatch)` or if it's an object, it will use `redux`'s `wrapActionCreators`.


## Notes

You'll probably notice that many providers have everything in a single file.  It makes sense for the simple ones, but you can of course structure everything however you want since it's ultimately just a single object.

You don't have to use generic provider packages.  Feel free to create a `providers` directory in your app and structure your exports however you like!

You'll also notice that **no constants are exported**.  There's a good reason for this.  Your components should have no knowledge of the constants used within your actions and reducers, which leads to a maximum separation of concerns and is always the best design.  Your components should care about only 2 things: what to render and which actions to call.
