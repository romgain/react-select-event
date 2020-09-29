/**
 * A simple compatibility method for react's "act".
 * If a recent version of @testing-library/react is already installed,
 * we just use their implementation - it's complete and has useful warnings.
 * Otherwise, we just default to a noop.
 *
 * We need this because react-select-event doesn't actually pin a
 * dependency version for @testing-library/react!
 */

type Callback = () => Promise<void | undefined> | void | undefined;
type AsyncAct = (callback: Callback) => Promise<undefined>;
type SyncAct = (callback: Callback) => void;

let act: AsyncAct | SyncAct;

try {
  act = require("@testing-library/react").act;
} catch (_) {
  // istanbul ignore next
  act = (callback: Function) => {
    callback();
  };
}

export default act;
