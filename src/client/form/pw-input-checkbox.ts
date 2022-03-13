import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import type { z } from "zod";
import type { routes } from "../../lib/routes.js";
import { PwInput } from "./pw-input.js";

// workaround see https://github.com/runem/lit-analyzer/issues/149#issuecomment-1006162839
export function pwInputCheckbox<
  P extends keyof typeof routes,
  T extends boolean | undefined
>(
  props: Pick<
    PwInputCheckbox<P, T>,
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
    | "trueValue"
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
    trueValue,
    defaultValue,
    value,
    ...rest
  } = props;
  let _ = rest;
  _ = 1; // ensure no property is missed - Don't use `{}` as a type. `{}` actually means "any non-nullish value".
  return html`<pw-input-checkbox
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
    .trueValue=${trueValue}
    .value=${value}
  ></pw-input-checkbox>`;
}

export class PwInputCheckbox<
  P extends keyof typeof routes,
  T extends boolean | undefined
> extends PwInput<P, T, HTMLInputElement> {
  static override get properties() {
    return {
      trueValue: { attribute: false },
      ...super.properties,
    };
  }

  trueValue!: T;

  myformdataEventListener = (
    event: CustomEvent<z.infer<typeof routes[P]["request"]>>
  ) => {
    if (!this.input.value) {
      throw new Error();
    }
    this.set(
      event.detail,
      this.input.value.checked ? this.trueValue : this.defaultValue
    );
  };
}

customElements.define("pw-input-checkbox", PwInputCheckbox);
