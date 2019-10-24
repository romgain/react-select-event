import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { render, wait, fireEvent } from "@testing-library/react";
import Select from "react-select";
import selectEvent from "..";
let Async: any;
let Creatable: any;
let AsyncCreatable: any;
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
}

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
  { label: "Mango", value: "mango" }
];
const defaultProps = { options: OPTIONS, name: "food", inputId: "food" };

const renderForm = (select: React.ReactNode) => {
  const result = render(
    <form data-testid="form">
      <label htmlFor="food">Food</label>
      {select}
    </form>
  );
  const form = result.getByTestId("form");
  const input = result.getByLabelText("Food");
  return { ...result, form, input };
};

describe("The select event helpers", () => {
  it("selects an option in a single-option input", async () => {
    const { form, input } = renderForm(<Select {...defaultProps} />);
    expect(form).toHaveFormValues({ food: "" });
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

  it("types in and add a new option", async () => {
    const { form, input } = renderForm(<Creatable {...defaultProps} />);
    expect(form).toHaveFormValues({ food: "" });
    await selectEvent.create(input, "papaya");
    expect(form).toHaveFormValues({ food: "papaya" });
  });

  it("types in and add a new option with custom create label when searching by fixed string", async () => {
    const { form, input } = renderForm(
      <Creatable {...defaultProps} formatCreateLabel={() => "Add new option"} />
    );
    expect(form).toHaveFormValues({ food: "" });

    await selectEvent.create(input, "papaya", "Add new option");

    expect(form).toHaveFormValues({ food: "papaya" });
  });

  it("types in and add a new option with custom create label when searching by dynamic string", async () => {
    const { form, input } = renderForm(
      <Creatable
        {...defaultProps}
        formatCreateLabel={(inputValue: string) => inputValue}
      />
    );
    expect(form).toHaveFormValues({ food: "" });

    await selectEvent.create(input, "papaya", "papaya");

    expect(form).toHaveFormValues({ food: "papaya" });
  });

  it("types in and add a new option with custom create label when searching by regexp", async () => {
    const { form, input } = renderForm(
      <Creatable
        {...defaultProps}
        formatCreateLabel={(inputValue: string) =>
          `Generate new option "${inputValue}"`
        }
      />
    );
    expect(form).toHaveFormValues({ food: "" });

    await selectEvent.create(input, "papaya", /Generate/);

    expect(form).toHaveFormValues({ food: "papaya" });
  });

  it("types in and add several options", async () => {
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
    selectEvent.clearFirst(input);
    await wait(() => {
      expect(form).toHaveFormValues({ food: "" });
    });
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
      food: ["chocolate", "vanilla", "strawberry"]
    });

    selectEvent.clearFirst(input);
    await wait(() => {
      expect(form).toHaveFormValues({ food: ["vanilla", "strawberry"] });
    });

    selectEvent.clearFirst(input);
    await wait(() => {
      expect(form).toHaveFormValues({ food: "strawberry" });
    });
  });

  it("clears the first item in a non-createable dropdown", async () => {
    const { form, input } = renderForm(
      <Select {...defaultProps} defaultValue={OPTIONS[0]} isClearable />
    );
    expect(form).toHaveFormValues({ food: "chocolate" });
    selectEvent.clearFirst(input);
    await wait(() => {
      expect(form).toHaveFormValues({ food: "" });
    });
  });

  it("clears all items in a single-select dropdown", async () => {
    const { form, input } = renderForm(
      <Creatable {...defaultProps} isMulti defaultValue={OPTIONS[0]} />
    );
    expect(form).toHaveFormValues({ food: "chocolate" });
    selectEvent.clearAll(input);
    await wait(() => {
      expect(form).toHaveFormValues({ food: "" });
    });
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
      food: ["chocolate", "vanilla", "strawberry"]
    });

    selectEvent.clearAll(input);
    await wait(() => {
      expect(form).toHaveFormValues({ food: "" });
    });
  });

  describe("AsyncCreatable", () => {
    // from https://github.com/JedWatson/react-select/blob/v3.0.0/docs/examples/CreatableAdvanced.js
    // mixed with Async Creatable Example from https://react-select.com/creatable
    type State = { options: Options; value: Option | void; isLoading: boolean };

    const filterOptions = (options: Options, inputValue: string) => {
      return options.filter(i =>
        i.label.toLowerCase().includes(inputValue.toLowerCase())
      );
    };

    class CreatableAdvanced extends React.Component<{}, State> {
      state = { isLoading: false, options: OPTIONS, value: undefined };

      handlePromiseOptions = (inputValue: string) =>
        new Promise(resolve => {
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
            value: newOption
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
      await wait();

      expect(form).toHaveFormValues({ food: "Choco" });
    });

    it("types in and adds a new option when not having similar options", async () => {
      const { form, input } = renderForm(
        <CreatableAdvanced {...defaultProps} />
      );

      await selectEvent.create(input, "papaya");
      await wait();

      expect(form).toHaveFormValues({ food: "papaya" });
    });
  });
});
