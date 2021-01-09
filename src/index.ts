/** Simulate user events on react-select dropdowns */

import {
  findAllByText,
  findByText,
  fireEvent,
  waitFor,
} from "@testing-library/dom";
import act from "./act-compat";

// find the react-select container from its input field 🤷
function getReactSelectContainerFromInput(input: HTMLElement): HTMLElement {
  return input.parentNode!.parentNode!.parentNode!.parentNode!
    .parentNode as HTMLElement;
}

/**
 * Utility for opening the select's dropdown menu.
 * @param {HTMLElement} input The input field (eg. `getByLabelText('The label')`)
 */
export const openMenu = (input: HTMLElement) => {
  fireEvent.focus(input);
  fireEvent.keyDown(input, {
    key: "ArrowDown",
    keyCode: 40,
    code: 40,
  });
};

// type text in the input field
const type = (input: HTMLElement, text: string) => {
  fireEvent.change(input, { target: { value: text } });
};

// press the "clear" button, and reset various states
const clear = async (input: HTMLElement, clearButton: Element) => {
  await act(async () => {
    fireEvent.mouseDown(clearButton);
    fireEvent.click(clearButton);
    // react-select will prevent the menu from opening, and asynchronously focus the select field...
    await waitFor(() => {});
    input.blur();
  });
};

interface Config {
  /** A container where the react-select dropdown gets rendered to.
   *  Useful when rendering the dropdown in a portal using `menuPortalTarget`.
   */
  container?: HTMLElement;
}

/**
 * Utility for selecting a value in a `react-select` dropdown.
 * @param {HTMLElement} input The input field (eg. `getByLabelText('The label')`)
 * @param {String|RegExp|String[]|RegExp[]} optionOrOptions The display name(s) for the option(s) to select
 * @param {Object} config Optional config options
 * @param {HTMLElement} config.container A container for the react-select and its dropdown (defaults to the react-select container)
 *                         Useful when rending the dropdown to a portal using react-select's `menuPortalTarget`
 */
export const select = async (
  input: HTMLElement,
  optionOrOptions: string | RegExp | Array<string | RegExp>,
  config: Config = {}
) => {
  const options = Array.isArray(optionOrOptions)
    ? optionOrOptions
    : [optionOrOptions];
  const container = config.container || getReactSelectContainerFromInput(input);

  await act(async () => {
    // Select the items we care about
    for (const option of options) {
      openMenu(input);

      // only consider visible, interactive elements
      const matchingElements = await findAllByText(container, option, {
        // @ts-ignore invalid rtl types :'(
        ignore: "[aria-live] *,[style*='visibility: hidden']",
      });

      // When the target option is already selected, the react-select display text
      // will also match the selector. In this case, the actual dropdown element is
      // positionned last in the DOM tree.
      const optionElement = matchingElements[matchingElements.length - 1];
      fireEvent.click(optionElement);
    }
  });
};

interface CreateConfig extends Config {
  createOptionText?: string | RegExp;
  waitForElement?: boolean;
}
/**
 * Utility for creating and selecting a value in a Creatable `react-select` dropdown.
 * @async
 * @param {HTMLElement} input The input field (eg. `getByLabelText('The label')`)
 * @param {String} option The display name for the option to type and select
 * @param {Object} config Optional config options
 * @param {HTMLElement} config.container A container for the react-select and its dropdown (defaults to the react-select container)
 *                         Useful when rending the dropdown to a portal using react-select's `menuPortalTarget`
 * @param {boolean} config.waitForElement Whether create should wait for new option to be populated in the select container
 * @param {String|RegExp} config.createOptionText Custom label for the "create new ..." option in the menu (string or regexp)
 */
export const create = async (
  input: HTMLElement,
  option: string,
  { waitForElement = true, ...config }: CreateConfig = {}
) => {
  const createOptionText = config.createOptionText || /^Create "/;
  openMenu(input);
  type(input, option);

  fireEvent.change(input, { target: { value: option } });

  await select(input, createOptionText, config);

  if (waitForElement) {
    await findByText(getReactSelectContainerFromInput(input), option);
  }
};

/**
 * Utility for clearing the first value of a `react-select` dropdown.
 * @param {HTMLElement} input The input field (eg. `getByLabelText('The label')`)
 */
export const clearFirst = async (input: HTMLElement) => {
  const container = getReactSelectContainerFromInput(input);
  // The "clear" button is constructed from the user-defined `${classNamePrefix}__multi-value__remove`.
  // This is built from the internal util `cx` of react-select, so we take advantage of the attribute selector here.
  const clearButton = container.querySelector('[class*="multi-value__remove"]')!;
  await clear(input, clearButton);
};

/**
 * Utility for clearing all values in a `react-select` dropdown.
 * @param {HTMLElement} input The input field (eg. `getByLabelText('The label')`)
 */
export const clearAll = async (input: HTMLElement) => {
  const container = getReactSelectContainerFromInput(input);
  // The "clear all" button is constructed from the user-defined `${classNamePrefix}__multi-value__remove`.
  // This is built from the internal util `cx` of react-select, so we take advantage of the attribute selector here.
  const clearAllButton = container.querySelector('[class*="clear-indicator"]')!;
  await clear(input, clearAllButton);
};

const selectEvent = { select, create, clearFirst, clearAll, openMenu };
export default selectEvent;
