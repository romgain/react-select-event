/** Simulate user events on react-select dropdowns */
// See https://stackoverflow.com/a/56085734

import { fireEvent, findByText, getByText } from "dom-testing-library";

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
 * @param inputSelector The input field (eg. `getByLabelText('The label')`)
 * @param optionOrOptions The display name(s) for the option(s) to select
 */
export const select = async (
  inputSelector: HTMLElement,
  optionOrOptions: string | Array<string>
) => {
  const options = Array.isArray(optionOrOptions)
    ? optionOrOptions
    : [optionOrOptions];
  const container = getReactSelectContainerFromInput(inputSelector);

  // Select the items we care about
  for (const option of options) {
    focus(inputSelector);
    await findByText(container, option);
    fireEvent.click(getByText(container, option));
  }
};

/**
 * Utility for creating and selecting a value in a Creatable `react-select` dropdown.
 * @param inputSelector The input field (eg. `getByLabelText('The label')`)
 * @param option The display name for the option to type and select
 */
export const create = (inputSelector: HTMLElement, option: string) => {
  focus(inputSelector);
  type(inputSelector, option);
  // hit Enter to add the item
  fireEvent.keyDown(inputSelector, {
    key: "Enter",
    keyCode: 13,
    code: 13
  });
};

/**
 * Utility for clearing the first value of a `react-select` dropdown.
 * @param inputSelector The input field (eg. `getByLabelText('The label')`)
 */
export const clearFirst = (inputSelector: HTMLElement) => {
  const container = getReactSelectContainerFromInput(inputSelector);
  // The "clear" button is the first svg element that is hidden to screen readers
  fireEvent.click(container.querySelector('svg[aria-hidden="true"]')!);
};

/**
 * Utility for clearing all values in a `react-select` dropdown.
 * @param inputSelector The input field (eg. `getByLabelText('The label')`)
 */
export const clearAll = (inputSelector: HTMLElement) => {
  const container = getReactSelectContainerFromInput(inputSelector);
  // The "clear all" button is the penultimate svg element that is hidden to screen readers
  // (the last one is the dropdown arrow)
  const elements = container.querySelectorAll('svg[aria-hidden="true"]');
  const element = elements[elements.length - 2];
  fireEvent.mouseDown(element);
};

export default { select, create, clearFirst, clearAll };
