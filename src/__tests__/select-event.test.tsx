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
    const { form, input } = renderForm(
      <Select {...defaultProps} isMulti />
    );
    expect(form).toHaveFormValues({ food: "" });

    await selectEvent.select(input, "Chocolate");
    expect(form).toHaveFormValues({ food: "chocolate" });

    await selectEvent.select(input, "Vanilla");
    expect(form).toHaveFormValues({ food: ["chocolate", "vanilla"] });
  });

  it("selects several options at the same time", async () => {
    const { form, input } = renderForm(
      <Select {...defaultProps} isMulti />
    );
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

  it("types in and add several options", async () => {
    const { form, input } = renderForm(
      <Creatable {...defaultProps} isMulti />
    );
    expect(form).toHaveFormValues({ food: "" });
    selectEvent.create(input, "papaya");
    selectEvent.create(input, "peanut butter");
    expect(form).toHaveFormValues({ food: ["papaya", "peanut butter"] });
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
});
