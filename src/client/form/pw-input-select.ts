import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import type { z } from "zod";
import type { routes } from "../../lib/routes.js";
import { PwInput } from "./pw-input.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwInputSelect<
  P extends keyof typeof routes,
  T extends string | number | undefined
>(
  props: Pick<
    PwInputSelect<P, T>,
    | "type"
    | "autocomplete"
    | "disabled"
    | "enabled"
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
    enabled,
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
  return html`<pw-input-select
    type=${type}
    ?disabled=${disabled}
    ?enabled=${enabled}
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
  ></pw-input-select>`;
}

export class PwInputSelect<
  P extends keyof typeof routes,
  T extends string | number | undefined
> extends PwInput<P, T, HTMLSelectElement> {
  myformdataEventListener = (
    event: CustomEvent<z.infer<typeof routes[P]["request"]>>
  ) => {
    if (!this.input.value) {
      throw new Error();
    }
    const input = this.input.value;
    this.set(
      event.detail,
      input.selectedIndex == -1
        ? this.defaultValue
        : this.options?.find((v) => v.value == input.value)?.value ??
            this.defaultValue // To make numbers work
    );
  };
}

customElements.define("pw-input-select", PwInputSelect);
