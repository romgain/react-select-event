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
[![Build Status](https://github.com/romgain/react-select-event/actions/workflows/ci.yml/badge.svg)](https://github.com/romgain/jest-websocket-mock/actions)
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

### `select(input: HTMLElement, optionOrOptions: Matcher | Array<Matcher>, config?: object): Promise<void>`

The `optionOrOptions` parameter can be any valid dom-testing-library [TextMatch](https://testing-library.com/docs/queries/about#textmatch) object (eg. string, regex, function, number).

Select one or more values in a react-select dropdown.

```jsx
const { getByRole, getByLabelText } = render(
  <form role="form">
    <label htmlFor="food">Food</label>
    <Select options={OPTIONS} name="food" inputId="food" isMulti />
  </form>
);
expect(getByRole("form")).toHaveFormValues({ food: "" });

await selectEvent.select(getByLabelText("Food"), ["Strawberry", "Mango"]);
expect(getByRole("form")).toHaveFormValues({ food: ["strawberry", "mango"] });

await selectEvent.select(getByLabelText("Food"), "Chocolate");
expect(getByRole("form")).toHaveFormValues({
  food: ["strawberry", "mango", "chocolate"],
});
```

This also works for [async selects](https://react-select.com/async):

```jsx
const { getByRole, getByLabelText } = render(
  <form role="form">
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
expect(getByRole("form")).toHaveFormValues({ food: "" });

// start typing to trigger the `loadOptions`
fireEvent.change(getByLabelText("Food"), { target: { value: "Choc" } });
await selectEvent.select(getByLabelText("Food"), "Chocolate");
expect(getByRole("form")).toHaveFormValues({
  food: ["chocolate"],
});
```

`select` also accepts an optional `config` parameter.
`config.container` can be used to specify a custom container to use when the `react-select` dropdown is rendered
in a portal using `menuPortalTarget`:

```jsx
const { getByRole, getByLabelText } = render(
  <form role="form">
    <label htmlFor="food">Food</label>
    <Select
      options={OPTIONS}
      name="food"
      inputId="food"
      isMulti
      menuPortalTarget={document.body}
    />
  </form>
);
await selectEvent.select(getByLabelText("Food"), ["Strawberry", "Mango"], {
  container: document.body,
});
expect(getByRole("form")).toHaveFormValues({ food: ["strawberry", "mango"] });
```

The container can also be passed in as a function if it needs to be lazily evaluated:

```jsx
const { getByRole, getByLabelText } = render(
  <form role="form">
    <label htmlFor="food">Food</label>
    <Select
      options={OPTIONS}
      name="food"
      inputId="food"
      isMulti
      menuPortalTarget={document.body}
    />
  </form>
);
await selectEvent.select(getByLabelText("Food"), ["Strawberry", "Mango"], {
  container: () => document.body.querySelector("[class$=-menu]"),
});
expect(getByRole("form")).toHaveFormValues({ food: ["strawberry", "mango"] });
```

### `create(input: HTMLElement, option: string, config?: object): Promise<void> }`

Creates and selects a new item. Only applicable to `react-select` [`Creatable`](https://react-select.com/creatable) elements.

```jsx
const { getByRole, getByLabelText } = render(
  <form role="form">
    <label htmlFor="food">Food</label>
    <Creatable options={OPTIONS} name="food" inputId="food" />
  </form>
);
expect(getByRole("form")).toHaveFormValues({ food: "" });
await selectEvent.create(getByLabelText("Food"), "papaya");
expect(getByRole("form")).toHaveFormValues({ food: "papaya" });
```

`create` take an optional `config` parameter:

- `config.createOptionText` can be used when [creating elements with a custom label text, using the `formatCreateLabel` prop](https://react-select.com/props#creatable-props).
- `config.container` can be used when the `react-select` dropdown is rendered in a portal using `menuPortalTarget`.
- `config.waitForElement` Whether `create` should wait for new option to be populated in the select container. Defaults to `true`.

### `clearFirst(input: HTMLElement): Promise<void>`

Clears the first value in the dropdown.

```jsx
const { getByRole, getByLabelText } = render(
  <form role="form">
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
expect(getByRole("form")).toHaveFormValues({ food: "chocolate" });
await selectEvent.clearFirst(getByLabelText("Food"));
expect(getByRole("form")).toHaveFormValues({ food: "" });
```

### `clearAll(input: HTMLElement): Promise<void>`

Clears all values in the dropdown.

```jsx
const { getByRole, getByLabelText } = render(
  <form role="form">
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
expect(getByRole("form")).toHaveFormValues({
  food: ["chocolate", "vanilla", "strawberry"],
});
await selectEvent.clearAll(getByLabelText("Food"));
expect(getByRole("form")).toHaveFormValues({ food: "" });
```

### `openMenu(input: HTMLElement): void`

Opens the select dropdown menu by focusing the input and simulating a down arrow keypress.

```jsx
const { getByLabelText, queryByText } = render(
  <form>
    <label htmlFor="food">Food</label>
    <Select options={[{ label: "Pizza", value: 1 }]} inputId="food" />
  </form>
);
expect(queryByText("Pizza")).toBeNull();
selectEvent.openMenu(getByLabelText("Food"));
expect(getByText("Pizza")).toBeInTheDocument();
```

## Credits

All the credit goes to [Daniel](https://stackoverflow.com/users/164268/daniel) and his StackOverflow answer: [https://stackoverflow.com/a/56085734](https://stackoverflow.com/a/56085734).
