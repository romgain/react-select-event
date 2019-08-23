<div align="center">
  <h1>react-select-event</h1>
  <a href="https://www.joypixels.com/emoji/1f997">
    <img height="80" width="80" alt="cricket" src="https://raw.githubusercontent.com/romgain/react-select-event/master/other/cricket.png" />
  </a>

  <p>Simulate user events on <a href="https://github.com/JedWatson/react-select">react-select</a> elements, for use with <a href="https://github.com/testing-library/react-testing-library">react-testing-library</a>.</p>

  <br />
</div>

<hr />

[![npm version](https://badge.fury.io/js/react-select-event.svg)](https://badge.fury.io/js/react-select-event)
[![Build Status](https://travis-ci.org/romgain/react-select-event.svg?branch=master)](https://travis-ci.org/romgain/react-select-event)
[![Coverage report](https://codecov.io/gh/romgain/react-select-event/branch/master/graph/badge.svg)](https://codecov.io/gh/romgain/react-select-event)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

## Install

```bash
npm install --save-dev react-select-event
```

Import `react-select-event` in your unit tests:

```js
import selectEvent from "react-select-event";
// or
const selectEvent = require("react-select-event");
```

### Supported versions of `react-select`

This library is tested against all versions of `react-select` starting from `2.1.0`.

## API

Every helper exported by `react-select-event` takes a handle on the `react-select` input field as its first argument. For instance, this can be: `getByLabelText("Your label name")`.

### `select(input: HTMLElement, optionOrOptions: string | RegExp | Array<string | RegExp>): Promise<void>`

Select one or more values in a react-select dropdown.

```jsx
const { getByTestId, getByLabelText } = render(
  <form data-testid="form">
    <label htmlFor="food">Food</label>
    <Select options={OPTIONS} name="food" inputId="food" isMulti />
  </form>
);
expect(getByTestId("form")).toHaveFormValues({ food: "" });

await selectEvent.select(getByLabelText("Food"), ["Strawberry", "Mango"]);
expect(getByTestId("form")).toHaveFormValues({ food: ["strawberry", "mango"] });

await selectEvent.select(getByLabelText("Food"), "Chocolate");
expect(getByTestId("form")).toHaveFormValues({
  food: ["strawberry", "mango", "chocolate"]
});
```

This also works for [async selects](https://react-select.com/async):

```jsx
const { getByTestId, getByLabelText } = render(
  <form data-testid="form">
    <label htmlFor="food">Food</label>
    <Async
      options={[]}
      loadOptions={fetchTheOptions}
      name="food"
      inputId="food"
      isMulti
    />
  </form>
);
expect(getByTestId("form")).toHaveFormValues({ food: "" });

// start typing to trigger the `loadOptions`
fireEvent.change(getByLabelText("Food"), { target: { value: "Choc" } });
await selectEvent.select(getByLabelText("Food"), "Chocolate");
expect(getByTestId("form")).toHaveFormValues({
  food: ["chocolate"]
});
```

### `create(input: HTMLElement, option: string, createOptionText: string | RegExp = /^Create "/): Promise<void>`

Creates and selects a new item. Only applicable to `react-select` [`Creatable`](https://react-select.com/creatable) elements.

```jsx
const { getByTestId, getByLabelText } = render(
  <form data-testid="form">
    <label htmlFor="food">Food</label>
    <Creatable options={OPTIONS} name="food" inputId="food" />
  </form>
);
expect(getByTestId("form")).toHaveFormValues({ food: "" });
await selectEvent.create(getByLabelText("Food"), "papaya");
expect(getByTestId("form")).toHaveFormValues({ food: "papaya" });
```

`create` take a third, optional parameter, only necessary when [creating elements with a custom label text, using the `formatCreateLabel` prop](https://react-select.com/props#creatable-props).

### `clearFirst(input: HTMLElement): void`

Clears the first value in the dropdown.

```jsx
const { getByTestId, getByLabelText } = render(
  <form data-testid="form">
    <label htmlFor="food">Food</label>
    <Creatable
      defaultValue={OPTIONS[0]}
      options={OPTIONS}
      name="food"
      inputId="food"
      isMulti
    />
  </form>
);
expect(getByTestId("form")).toHaveFormValues({ food: "chocolate" });
selectEvent.clearFirst(getByLabelText("Food"));
await wait(() => {
  expect(getByTestId("form")).toHaveFormValues({ food: "" });
});
```

### `clearAll(input: HTMLElement): void`

Clears all values in the dropdown.

```jsx
const { getByTestId, getByLabelText } = render(
  <form data-testid="form">
    <label htmlFor="food">Food</label>
    <Creatable
      defaultValue={[OPTIONS[0], OPTIONS[1], OPTIONS[2]]}
      options={OPTIONS}
      name="food"
      inputId="food"
      isMulti
    />
  </form>
);
expect(getByTestId("form")).toHaveFormValues({
  food: ["chocolate", "vanilla", "strawberry"]
});
selectEvent.clearFirst(getByLabelText("Food"));
await wait(() => {
  expect(getByTestId("form")).toHaveFormValues({ food: "" });
});
```

## Credits

All the credit goes to [Daniel](https://stackoverflow.com/users/164268/daniel) and his StackOverflow answer: [https://stackoverflow.com/a/56085734](https://stackoverflow.com/a/56085734).
