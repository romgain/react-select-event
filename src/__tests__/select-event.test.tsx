import "@testing-library/jest-dom/extend-expect";

import { fireEvent, render } from "@testing-library/react";

import React from "react";
import Select from "react-select";
import selectEvent from "..";

let Async: any;
let Creatable: any;
let AsyncCreatable: any;
let IS_V2 = false;
try {
  // v3
  Async = require("react-select/async").default;
  Creatable = require("react-select/creatable").default;
  AsyncCreatable = require("react-select/async-creatable").default;
} catch (_) {
  // v2
  Async = require("react-select/lib/Async").default;
  Creatable = require("react-select/lib/Creatable").default;
  AsyncCreatable = require("react-select/lib/AsyncCreatable").default;
  IS_V2 = true;
}

const skip_on_v2 = IS_V2 ? xit : it;

type Callback = (options: Options) => void;
interface Option {
  label: string;
  value: string;
}
type Options = Array<Option>;

const OPTIONS: Options = [
  { label: "Chocolate", value: "chocolate" },
  { label: "Vanilla", value: "vanilla" },
  { label: "Strawberry", value: "strawberry" },
  { label: "Mango", value: "mango" },
];
const defaultProps = { options: OPTIONS, name: "food", inputId: "food" };

const matchText = (text: string | RegExp) => (content: string) =>
  Boolean(content === text || content.match(text));

const renderForm = (select: React.ReactNode) => {
  const result = render(
    <form role="form">
      <label htmlFor="food">Food</label>
      {select}
    </form>
  );
  const form = result.getByRole("form");
  const input = result.getByLabelText("Food");
  return { ...result, form, input };
};

describe("The openMenu event helper", () => {
  it("opens the menu", () => {
    const { getByLabelText, queryByText } = renderForm(
      <Select {...defaultProps} />
    );
    // option is not yet visible
    expect(queryByText("Chocolate")).toBeNull();
    selectEvent.openMenu(getByLabelText("Food"));
    // option can now be seen because menu is open
    expect(queryByText("Chocolate")).toBeInTheDocument();
  });

  it("does not prevent selecting options", async () => {
    const { form, input, getByText } = renderForm(<Select {...defaultProps} />);
    selectEvent.openMenu(input);
    expect(getByText("Chocolate")).toBeInTheDocument();
    expect(getByText("Vanilla")).toBeInTheDocument();
    expect(getByText("Strawberry")).toBeInTheDocument();
    expect(getByText("Mango")).toBeInTheDocument();
    await selectEvent.select(input, "Strawberry");
    expect(form).toHaveFormValues({ food: "strawberry" });
  });
});

describe("The select event helpers", () => {
  it("selects an option in a single-option input", async () => {
    const { form, input } = renderForm(<Select {...defaultProps} />);
    expect(form).toHaveFormValues({ food: "" });
    await selectEvent.select(input, "Chocolate");
    expect(form).toHaveFormValues({ food: "chocolate" });
  });

  it("re-selects an option in a single-option input", async () => {
    const { form, input } = renderForm(<Select {...defaultProps} />);
    expect(form).toHaveFormValues({ food: "" });
    await selectEvent.select(input, "Chocolate");
    await selectEvent.select(input, "Chocolate");
    await selectEvent.select(input, "Chocolate");
    expect(form).toHaveFormValues({ food: "chocolate" });
  });

  it("selects several options in a multi-options input", async () => {
    const { form, input } = renderForm(<Select {...defaultProps} isMulti />);
    expect(form).toHaveFormValues({ food: "" });

    await selectEvent.select(input, "Chocolate");
    expect(form).toHaveFormValues({ food: "chocolate" });

    await selectEvent.select(input, "Vanilla");
    expect(form).toHaveFormValues({ food: ["chocolate", "vanilla"] });
  });

  it("selects several options at the same time", async () => {
    const { form, input } = renderForm(<Select {...defaultProps} isMulti />);
    expect(form).toHaveFormValues({ food: "" });
    await selectEvent.select(input, ["Strawberry", "Mango"]);
    expect(form).toHaveFormValues({ food: ["strawberry", "mango"] });
  });

  it("selects several duplicated options", async () => {
    const { form, input } = renderForm(<Select {...defaultProps} isMulti />);
    expect(form).toHaveFormValues({ food: "" });
    await selectEvent.select(input, ["Strawberry", "Mango", "Strawberry"]);
    expect(form).toHaveFormValues({ food: ["strawberry", "mango"] });
    await selectEvent.select(input, ["Mango"]);
    expect(form).toHaveFormValues({ food: ["strawberry", "mango"] });
  });

  it("selects an option in a custom dropdown", async () => {
    const { form, input } = renderForm(
      <Select
        {...defaultProps}
        formatOptionLabel={({ label }) => <div>This is a {label}</div>}
      />
    );
    expect(form).toHaveFormValues({ food: "" });
    await selectEvent.select(input, /Chocolate/);
    expect(form).toHaveFormValues({ food: "chocolate" });
  });

  it("selects an option with a matcher function", async () => {
    const { form, input } = renderForm(<Select {...defaultProps} />);
    expect(form).toHaveFormValues({ food: "" });
    await selectEvent.select(input, matchText(/Chocolate/));
    expect(form).toHaveFormValues({ food: "chocolate" });
  });

  it("selects several options with a matcher function", async () => {
    const { form, input } = renderForm(<Select {...defaultProps} isMulti />);
    expect(form).toHaveFormValues({ food: "" });
    await selectEvent.select(input, ["Strawberry", /Mango/].map(matchText));
    expect(form).toHaveFormValues({ food: ["strawberry", "mango"] });
  });

  it("selects an option with a number", async () => {
    const { form, input } = renderForm(
      <Select
        {...defaultProps}
        formatOptionLabel={(option) => option.label.length}
      />
    );
    expect(form).toHaveFormValues({ food: "" });
    await selectEvent.select(input, 5);
    expect(form).toHaveFormValues({ food: "mango" });
  });

  it("selects several options with a number", async () => {
    const { form, input } = renderForm(
      <Select
        {...defaultProps}
        formatOptionLabel={(option) => option.label.length}
        isMulti
      />
    );
    expect(form).toHaveFormValues({ food: "" });
    await selectEvent.select(input, [7, 5]);
    expect(form).toHaveFormValues({ food: ["vanilla", "mango"] });
  });

  it("types in and adds a new option", async () => {
    const { form, input } = renderForm(<Creatable {...defaultProps} />);
    expect(form).toHaveFormValues({ food: "" });
    await selectEvent.create(input, "papaya");
    expect(form).toHaveFormValues({ food: "papaya" });
  });

  it("types in and adds a new option but does not wait for it", async () => {
    const { form, input } = renderForm(<Creatable {...defaultProps} />);
    expect(form).toHaveFormValues({ food: "" });
    await selectEvent.create(input, "papaya", { waitForElement: false });
    expect(form).toHaveFormValues({ food: "papaya" });
  });

  it("types in and adds a new option with custom create label when searching by fixed string", async () => {
    const { form, input } = renderForm(
      <Creatable {...defaultProps} formatCreateLabel={() => "Add new option"} />
    );
    expect(form).toHaveFormValues({ food: "" });

    await selectEvent.create(input, "papaya", {
      createOptionText: "Add new option",
    });

    expect(form).toHaveFormValues({ food: "papaya" });
  });

  it("types in and adds a new option with custom create label when searching by dynamic string", async () => {
    const { form, input } = renderForm(
      <Creatable
        {...defaultProps}
        formatCreateLabel={(inputValue: string) => inputValue}
      />
    );
    expect(form).toHaveFormValues({ food: "" });

    await selectEvent.create(input, "papaya", { createOptionText: "papaya" });

    expect(form).toHaveFormValues({ food: "papaya" });
  });

  it("types in and adds a new option with custom create label when searching by regexp", async () => {
    const { form, input } = renderForm(
      <Creatable
        {...defaultProps}
        formatCreateLabel={(inputValue: string) =>
          `Generate new option "${inputValue}"`
        }
      />
    );
    expect(form).toHaveFormValues({ food: "" });

    await selectEvent.create(input, "papaya", { createOptionText: /Generate/ });

    expect(form).toHaveFormValues({ food: "papaya" });
  });

  it("types in and adds several options", async () => {
    const { form, input } = renderForm(<Creatable {...defaultProps} isMulti />);
    expect(form).toHaveFormValues({ food: "" });
    await selectEvent.create(input, "papaya");
    await selectEvent.create(input, "peanut butter");
    expect(form).toHaveFormValues({ food: ["papaya", "peanut butter"] });
  });

  it("selects an option in an async input", async () => {
    const loadOptions = (_: string, callback: Callback) =>
      setTimeout(() => callback(OPTIONS), 100);
    const { form, input } = renderForm(
      <Async {...defaultProps} loadOptions={loadOptions} options={[]} />
    );
    expect(form).toHaveFormValues({ food: "" });

    // start typing to trigger the `loadOptions`
    fireEvent.change(input, { target: { value: "Choc" } });
    await selectEvent.select(input, "Chocolate");
    expect(form).toHaveFormValues({ food: "chocolate" });
  });

  it("clears the first item in a single-select dropdown", async () => {
    const { form, input } = renderForm(
      <Creatable {...defaultProps} isMulti defaultValue={OPTIONS[0]} />
    );
    expect(form).toHaveFormValues({ food: "chocolate" });
    await selectEvent.clearFirst(input);
    expect(form).toHaveFormValues({ food: "" });
  });

  it("clears the first item in a multi-select dropdown", async () => {
    const { form, input } = renderForm(
      <Creatable
        {...defaultProps}
        isMulti
        defaultValue={[OPTIONS[0], OPTIONS[1], OPTIONS[2]]}
      />
    );
    expect(form).toHaveFormValues({
      food: ["chocolate", "vanilla", "strawberry"],
    });

    await selectEvent.clearFirst(input);
    expect(form).toHaveFormValues({ food: ["vanilla", "strawberry"] });

    await selectEvent.clearFirst(input);
    expect(form).toHaveFormValues({ food: "strawberry" });
  });

  it("clears the first item in a non-createable dropdown", async () => {
    const { form, input } = renderForm(
      <Select {...defaultProps} defaultValue={OPTIONS[0]} isClearable />
    );
    expect(form).toHaveFormValues({ food: "chocolate" });
    await selectEvent.clearFirst(input);
    expect(form).toHaveFormValues({ food: "" });
  });

  it("clears, then re-selects an item", async () => {
    const { form, input } = renderForm(
      <Select {...defaultProps} defaultValue={OPTIONS[0]} isClearable />
    );
    expect(form).toHaveFormValues({ food: "chocolate" });
    await selectEvent.clearFirst(input);
    expect(form).toHaveFormValues({ food: "" });
    await selectEvent.select(input, "Chocolate");
    expect(form).toHaveFormValues({ food: "chocolate" });
  });

  it("clears all items in a single-select dropdown", async () => {
    const { form, input } = renderForm(
      <Creatable {...defaultProps} isMulti defaultValue={OPTIONS[0]} />
    );
    expect(form).toHaveFormValues({ food: "chocolate" });
    await selectEvent.clearAll(input);
    expect(form).toHaveFormValues({ food: "" });
  });

  it("clears all items in a multi-select dropdown", async () => {
    const { form, input } = renderForm(
      <Creatable
        {...defaultProps}
        isMulti
        defaultValue={[OPTIONS[0], OPTIONS[1], OPTIONS[2]]}
      />
    );
    expect(form).toHaveFormValues({
      food: ["chocolate", "vanilla", "strawberry"],
    });

    await selectEvent.clearAll(input);
    expect(form).toHaveFormValues({ food: "" });
  });

  it("clears all items, then selects a new one", async () => {
    const { form, input } = renderForm(
      <Creatable
        {...defaultProps}
        isMulti
        defaultValue={[OPTIONS[0], OPTIONS[1], OPTIONS[2]]}
      />
    );
    expect(form).toHaveFormValues({
      food: ["chocolate", "vanilla", "strawberry"],
    });

    await selectEvent.clearAll(input);
    expect(form).toHaveFormValues({ food: "" });
    await selectEvent.select(input, "Vanilla");
    expect(form).toHaveFormValues({ food: "vanilla" });
  });

  describe("when asynchronously generating the list of options", () => {
    // from https://github.com/JedWatson/react-select/blob/v3.0.0/docs/examples/CreatableAdvanced.js
    // mixed with Async Creatable Example from https://react-select.com/creatable
    type State = { options: Options; value: Option | void; isLoading: boolean };

    const filterOptions = (options: Options, inputValue: string) => {
      return options.filter((i) =>
        i.label.toLowerCase().includes(inputValue.toLowerCase())
      );
    };

    class CreatableAdvanced extends React.Component<{}, State> {
      state = { isLoading: false, options: OPTIONS, value: undefined };

      handlePromiseOptions = (inputValue: string) =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(filterOptions(this.state.options, inputValue));
          }, 5);
        });

      handleChange = (newValue: Option) => this.setState({ value: newValue });

      handleCreate = (inputValue: string) => {
        this.setState({ isLoading: true });
        setTimeout(() => {
          const { options } = this.state;
          const newOption = { label: inputValue, value: inputValue };
          this.setState({
            isLoading: false,
            options: [...options, newOption],
            value: newOption,
          });
        }, 5);
      };

      render() {
        const { isLoading, value } = this.state;
        return (
          <AsyncCreatable
            {...this.props}
            isClearable
            isDisabled={isLoading}
            isLoading={isLoading}
            onChange={this.handleChange}
            onCreateOption={this.handleCreate}
            loadOptions={this.handlePromiseOptions}
            value={value}
          />
        );
      }
    }

    it("types in and adds a new option when having similar options", async () => {
      const { form, input } = renderForm(
        <CreatableAdvanced {...defaultProps} />
      );

      await selectEvent.create(input, "Choco");
      expect(form).toHaveFormValues({ food: "Choco" });
    });

    it("types in and adds a new option when not having similar options", async () => {
      const { form, input, findByDisplayValue } = renderForm(
        <CreatableAdvanced {...defaultProps} />
      );

      await selectEvent.create(input, "papaya");
      await findByDisplayValue("papaya");

      expect(form).toHaveFormValues({ food: "papaya" });
    });
  });

  describe("when rendering the dropdown in a portal", () => {
    it("selects an option", async () => {
      const { form, input } = renderForm(
        <Select {...defaultProps} menuPortalTarget={document.body} />
      );
      expect(form).toHaveFormValues({ food: "" });
      await selectEvent.select(input, "Chocolate", {
        container: document.body,
      });
      expect(form).toHaveFormValues({ food: "chocolate" });
    });

    skip_on_v2("lazily targets the dropdown when selecting", async () => {
      // skipping this test on react-select version 2 as the "...-menu" classname
      // was only added with the move to emotion in v3
      const { form, input } = renderForm(
        <Select {...defaultProps} menuPortalTarget={document.body} />
      );
      expect(form).toHaveFormValues({ food: "" });
      await selectEvent.select(input, "Chocolate", {
        container: () =>
          document.body.querySelector("[class$=-menu]") as HTMLElement,
      });
      expect(form).toHaveFormValues({ food: "chocolate" });
    });

    it("types in and adds a new option", async () => {
      const { form, input } = renderForm(
        <Creatable {...defaultProps} menuPortalTarget={document.body} />
      );
      expect(form).toHaveFormValues({ food: "" });
      await selectEvent.create(input, "papaya", { container: document.body });
      expect(form).toHaveFormValues({ food: "papaya" });
    });

    it("clears the first item in a multi-select dropdown", async () => {
      const { form, input } = renderForm(
        <Creatable
          {...defaultProps}
          isMulti
          defaultValue={[OPTIONS[0], OPTIONS[1], OPTIONS[2]]}
          menuPortalTarget={document.body}
        />
      );
      expect(form).toHaveFormValues({
        food: ["chocolate", "vanilla", "strawberry"],
      });

      await selectEvent.clearFirst(input);
      expect(form).toHaveFormValues({ food: ["vanilla", "strawberry"] });
    });

    it("clears all items", async () => {
      const { form, input } = renderForm(
        <Creatable
          {...defaultProps}
          isMulti
          defaultValue={[OPTIONS[0], OPTIONS[1], OPTIONS[2]]}
          menuPortalTarget={document.body}
        />
      );
      expect(form).toHaveFormValues({
        food: ["chocolate", "vanilla", "strawberry"],
      });

      await selectEvent.clearAll(input);
      expect(form).toHaveFormValues({ food: "" });
    });
  });
});
