import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import type { z } from "zod";
import type { routes } from "../../lib/routes.js";
import { PwInput } from "./pw-input.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwInputFile<P extends keyof typeof routes>(
  props: Pick<
    PwInputFile<P>,
    | "type"
    | "autocomplete"
    | "disabled"
    | "initial"
    | "label"
    | "name"
    | "url"
    | "get"
    | "set"
    | "options"
    | "task"
    | "defaultValue"
    | "value"
  >
) {
  const {
    disabled,
    initial,
    label,
    options,
    name,
    get,
    set,
    url,
    task,
    type,
    autocomplete,
    defaultValue,
    value,
    ...rest
  } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-input-file
    type=${type}
    ?disabled=${disabled}
    .label=${label}
    .get=${get}
    .set=${set}
    .url=${url}
    .name=${name}
    .options=${options}
    autocomplete=${ifDefined(autocomplete)}
    .task=${task}
    .initial=${initial}
    .defaultValue=${defaultValue}
    .value=${value}
  ></pw-input-file>`;
}

export class PwInputFile<P extends keyof typeof routes> extends PwInput<
  P,
  Promise<string> | undefined,
  HTMLInputElement
> {
  myformdataEventListener = (
    event: CustomEvent<z.infer<typeof routes[P]["request"]>>
  ) => {
    if (!this.input.value) {
      throw new Error();
    }
    if (this.input.value.files?.length === 1) {
      this.set(event.detail, this.input.value.files.item(0)?.text());
    }
  };
}

customElements.define("pw-input-file", PwInputFile);
