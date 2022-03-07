import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import type { z } from "zod";
import type { routes } from "../../lib/routes.js";
import { PwInput } from "./pw-input.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwInputText<P extends keyof typeof routes, T extends string|undefined|null>(
  props: Pick<
    PwInputText<P, T>,
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
  return html`<pw-input-text
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
  ></pw-input-text>`;
}

export class PwInputText<P extends keyof typeof routes, T extends string|undefined|null> extends PwInput<
  P,
  T,
  HTMLInputElement
> {
  myformdataEventListener = (
    event: CustomEvent<z.infer<typeof routes[P]["request"]>>
  ) => {
    if (!this.input.value) {
        throw new Error()
    }
    if (!this.input.value) {
      throw new Error()
    }
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const val = this.input.value.value as T;
    this.set(event.detail, val === "" ? this.defaultValue : val);
  };
}

customElements.define("pw-input-text", PwInputText);
