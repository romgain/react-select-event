import "jest-dom/extend-expect";
import React from "react";
import { render, wait } from "react-testing-library";
import Select, { Creatable } from "react-select";
import selectEvent from "..";

const OPTIONS = [
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
  const getForm = () => result.getByTestId("form");
  const getInput = () => result.getByLabelText("Food");
  return { ...result, getForm, getInput };
};

describe("The select event helpers", () => {
  it("selects an option in a single-option input", async () => {
    const { getForm, getInput } = renderForm(<Select {...defaultProps} />);
    expect(getForm()).toHaveFormValues({ food: "" });
    await selectEvent.select(getInput(), "Chocolate");
    expect(getForm()).toHaveFormValues({ food: "chocolate" });
  });

  it("selects several options in a multi-options input", async () => {
    const { getForm, getInput } = renderForm(
      <Select {...defaultProps} isMulti />
    );
    expect(getForm()).toHaveFormValues({ food: "" });

    await selectEvent.select(getInput(), "Chocolate");
    expect(getForm()).toHaveFormValues({ food: "chocolate" });

    await selectEvent.select(getInput(), "Vanilla");
    expect(getForm()).toHaveFormValues({ food: ["chocolate", "vanilla"] });
  });

  it("selects several options at the same time", async () => {
    const { getForm, getInput } = renderForm(
      <Select {...defaultProps} isMulti />
    );
    expect(getForm()).toHaveFormValues({ food: "" });
    await selectEvent.select(getInput(), ["Strawberry", "Mango"]);
    expect(getForm()).toHaveFormValues({ food: ["strawberry", "mango"] });
  });

  it("types in and add a new option", async () => {
    const { getForm, getInput } = renderForm(<Creatable {...defaultProps} />);
    expect(getForm()).toHaveFormValues({ food: "" });
    await selectEvent.create(getInput(), "papaya");
    expect(getForm()).toHaveFormValues({ food: "papaya" });
  });

  it("types in and add several options", async () => {
    const { getForm, getInput } = renderForm(
      <Creatable {...defaultProps} isMulti />
    );
    expect(getForm()).toHaveFormValues({ food: "" });
    selectEvent.create(getInput(), "papaya");
    selectEvent.create(getInput(), "peanut butter");
    expect(getForm()).toHaveFormValues({ food: ["papaya", "peanut butter"] });
  });

  it("clears the first item in a single-select dropdown", async () => {
    const { getForm, getInput } = renderForm(
      <Creatable {...defaultProps} isMulti defaultValue={OPTIONS[0]} />
    );
    expect(getForm()).toHaveFormValues({ food: "chocolate" });
    selectEvent.clearFirst(getInput());
    await wait(() => {
      expect(getForm()).toHaveFormValues({ food: "" });
    });
  });

  it("clears the first item in a multi-select dropdown", async () => {
    const { getForm, getInput } = renderForm(
      <Creatable
        {...defaultProps}
        isMulti
        defaultValue={[OPTIONS[0], OPTIONS[1], OPTIONS[2]]}
      />
    );
    expect(getForm()).toHaveFormValues({
      food: ["chocolate", "vanilla", "strawberry"]
    });

    selectEvent.clearFirst(getInput());
    await wait(() => {
      expect(getForm()).toHaveFormValues({ food: ["vanilla", "strawberry"] });
    });

    selectEvent.clearFirst(getInput());
    await wait(() => {
      expect(getForm()).toHaveFormValues({ food: "strawberry" });
    });
  });

  it("clears all items in a single-select dropdown", async () => {
    const { getForm, getInput } = renderForm(
      <Creatable {...defaultProps} isMulti defaultValue={OPTIONS[0]} />
    );
    expect(getForm()).toHaveFormValues({ food: "chocolate" });
    selectEvent.clearAll(getInput());
    await wait(() => {
      expect(getForm()).toHaveFormValues({ food: "" });
    });
  });

  it("clears all items in a multi-select dropdown", async () => {
    const { getForm, getInput } = renderForm(
      <Creatable
        {...defaultProps}
        isMulti
        defaultValue={[OPTIONS[0], OPTIONS[1], OPTIONS[2]]}
      />
    );
    expect(getForm()).toHaveFormValues({
      food: ["chocolate", "vanilla", "strawberry"]
    });

    selectEvent.clearAll(getInput());
    await wait(() => {
      expect(getForm()).toHaveFormValues({ food: "" });
    });
  });
});
