/**
 * @file 影视剧详情表单
 */
import { createSignal, For, JSX, Show } from "solid-js";
import { Minus, Plus } from "lucide-solid";

import { FormCore } from "@/domains/ui/form";
import { FormFieldCore } from "@/domains/ui/form/field";
import { SelectCore } from "@/domains/ui";
import { DatePickerCore } from "@/domains/ui/date-picker";
import { InputCore } from "@/domains/ui/form/input";
import { DragZoneCore } from "@/domains/ui/drag-zone";
import { ListContainerCore } from "@/domains/ui/form/list";
import { ImageUploadCore } from "@/domains/ui/form/image-upload";
import { MediaTypes } from "@/constants/index";
import { cn } from "@/utils/index";

import { Select } from "./select";
import { DatePicker } from "./date-picker";
import { Field } from "./field";
import { Input } from "./input";
import { ListContainer } from "./list-container";
import { DragZone } from "./drag-zone";
import { ImageUpload } from "./image-upload";
import { Textarea } from "./textarea";

export function MediaProfileValuesForm(
  props: {
    store: FormCore<{
      cover: FormFieldCore<{ label: string; name: string; input: ImageUploadCore }>;
      type: FormFieldCore<{ label: string; name: string; input: SelectCore<MediaTypes> }>;
      name: FormFieldCore<{ label: string; name: string; input: InputCore<string> }>;
      air_date: FormFieldCore<{ label: string; name: string; input: DatePickerCore }>;
      order: FormFieldCore<{ label: string; name: string; input: InputCore<number> }>;
      overview: FormFieldCore<{ label: string; name: string; input: InputCore<string> }>;
      episodes: FormFieldCore<{
        label: string;
        name: string;
        input: ListContainerCore<{
          defaultValue: {}[];
          factory: () => FormCore<{
            name: FormFieldCore<{ label: string; name: string; input: InputCore<string> }>;
            overview: FormFieldCore<{ label: string; name: string; input: InputCore<string> }>;
          }>;
        }>;
      }>;
    }>;
  } & JSX.HTMLAttributes<HTMLDivElement>
) {
  const { store } = props;

  const [state, setState] = createSignal(store.state);
  const [state2, setState2] = createSignal(store.fields.episodes.$input.state);
  store.onStateChange((v) => setState(v));
  store.fields.episodes.$input.onStateChange((v) => setState2(v));

  console.log(store.fields);

  return (
    <div class="p-2">
      <div>
        <div class="flex">
          <ImageUpload class="relative w-[180px] h-[270px]" store={store.fields.cover.$input} />
          <div class="flex-1 w-0 ml-2">
            <div class="space-y-2">
              <Field store={store.fields.name}>
                <Input store={store.fields.name.$input} />
              </Field>
              <div class="flex items-center space-x-2">
                <Field store={store.fields.type}>
                  <Select class="w-[96px]" store={store.fields.type.$input} />
                </Field>
                <Field store={store.fields.air_date}>
                  <DatePicker store={store.fields.air_date.$input} />
                </Field>
              </div>
              <Field store={store.fields.overview}>
                <Textarea store={store.fields.overview.$input} />
              </Field>
            </div>
          </div>
        </div>
        <div class="w-full h-[1px] my-2 bg-w-bg-2"></div>
        <div>
          <Field
            store={store.fields.episodes}
            extra={
              <div
                class="p-1 cursor-pointer hover:bg-slate-100"
                onClick={() => {
                  store.fields.episodes.$input.append();
                }}
              >
                <Plus class="w-6 h-6" />
              </div>
            }
          >
            <div class="space-y-1">
              <For each={state2().list}>
                {(field) => {
                  return (
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <Input store={field.$input.fields.name.$input} />
                        <Input store={field.$input.fields.overview.$input} />
                      </div>
                      <Show when={state2().canRemove} fallback={<div class="p-1 w-[24px] h-[24px]"></div>}>
                        <div
                          class="p-1 cursor-pointer hover:bg-slate-100"
                          onClick={() => {
                            store.fields.episodes.$input.removeFieldByIndex(field.index);
                          }}
                        >
                          <Minus class="w-4 h-4" />
                        </div>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          </Field>
        </div>
      </div>
      {/* <For each={state().fields}>
        {(field) => {
          const $input = field.$input;
          const elm = (() => {
            if ($input.shape === "date-picker") {
              return <DatePicker store={$input as DatePickerCore} />;
            }
            if ($input.shape === "input") {
              return <Input store={$input as InputCore<any>} />;
            }
            if ($input.shape === "select") {
              return <Select store={$input as SelectCore<any>} />;
            }
            if ($input.shape === "list") {
              return <ListContainer store={$input as ListContainerCore} />;
            }
            return null;
          })();
          const extra = (() => {
            if ($input.shape === "list") {
              const $ins = $input as ListContainerCore;
              return (
                <div
                  class="p-1 cursor-pointer hover:bg-slate-100"
                  onClick={() => {
                    $ins.append();
                  }}
                >
                  <Plus class="w-6 h-6" />
                </div>
              );
            }
            return null;
          })();
          return (
            <Field store={field} extra={extra}>
              {elm}
            </Field>
          );
        }}
      </For> */}
    </div>
  );
}
