/** Simulate user events on react-select dropdowns */

import { fireEvent, findByText, getByText } from "@testing-library/dom";

// find the react-select container from its input field 🤷
function getReactSelectContainerFromInput(input: HTMLElement): HTMLElement {
  return input.parentNode!.parentNode!.parentNode!.parentNode!
    .parentNode as HTMLElement;
}

// focus the `react-select` input field
const focus = (input: HTMLElement) => {
  fireEvent.focus(input);
  fireEvent.keyDown(input, {
    key: "ArrowDown",
    keyCode: 40,
    code: 40
  });
};

// type text in the input field
const type = (input: HTMLElement, text: string) => {
  fireEvent.change(input, { target: { value: text } });
};

/**
 * Utility for selecting a value in a `react-select` dropdown.
 * @param input The input field (eg. `getByLabelText('The label')`)
 * @param optionOrOptions The display name(s) for the option(s) to select
 */
export const select = async (
  input: HTMLElement,
  optionOrOptions: string | Array<string>
) => {
  const options = Array.isArray(optionOrOptions)
    ? optionOrOptions
    : [optionOrOptions];
  const container = getReactSelectContainerFromInput(input);

  // Select the items we care about
  for (const option of options) {
    focus(input);
    await findByText(container, option);
    fireEvent.click(getByText(container, option));
  }
};

/**
 * Utility for creating and selecting a value in a Creatable `react-select` dropdown.
 * @param input The input field (eg. `getByLabelText('The label')`)
 * @param option The display name for the option to type and select
 */
export const create = async (input: HTMLElement, option: string) => {
  focus(input);
  type(input, option);
  // hit Enter to add the item
  fireEvent.keyDown(input, {
    key: "Enter",
    keyCode: 13,
    code: 13
  });
  await findByText(getReactSelectContainerFromInput(input), option);
};

/**
 * Utility for clearing the first value of a `react-select` dropdown.
 * @param input The input field (eg. `getByLabelText('The label')`)
 */
export const clearFirst = (input: HTMLElement) => {
  const container = getReactSelectContainerFromInput(input);
  // The "clear" button is the first svg element that is hidden to screen readers
  fireEvent.click(container.querySelector('svg[aria-hidden="true"]')!);
};

/**
 * Utility for clearing all values in a `react-select` dropdown.
 * @param input The input field (eg. `getByLabelText('The label')`)
 */
export const clearAll = (input: HTMLElement) => {
  const container = getReactSelectContainerFromInput(input);
  // The "clear all" button is the penultimate svg element that is hidden to screen readers
  // (the last one is the dropdown arrow)
  const elements = container.querySelectorAll('svg[aria-hidden="true"]');
  const element = elements[elements.length - 2];
  fireEvent.mouseDown(element);
};

export default { select, create, clearFirst, clearAll };
