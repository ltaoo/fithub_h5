import { For, Switch, Match, createSignal } from "solid-js";
import { Trash, ArrowUp, ArrowDown } from "lucide-solid";

import { ObjectFieldCore, ArrayFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { TagInput } from "@/components/ui/tag-input";
import { EquipmentSelectView } from "@/components/equipment-select";
import { MuscleSelectView } from "@/components/muscle-select";

function WorkoutActionSingleValuesView(props: { store: SingleFieldCore<any> }) {
  const { store } = props;

  const [state, setState] = createSignal(store.state);

  store.onStateChange((v) => setState(v));

  return (
    <div class="w-full">
      {(() => {
        if (state().input?.type === "textarea") {
          return (
            <textarea
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={state().input?.value}
              onChange={(event) => {
                store.handleValueChange(event.target.value);
              }}
            />
          );
        }
        if (state().input?.type === "equipment_select") {
          return <EquipmentSelectView store={store.input} />;
        }
        if (state().input?.type === "muscle_select") {
          return <MuscleSelectView store={store.input} />;
        }
        if (state().input?.shape === "tag-input") {
          return <TagInput store={store.input} />;
        }
        if (state().input?.shape === "input") {
          return (
            <input
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={state().input?.value}
              onChange={(event) => {
                store.handleValueChange(event.target.value);
              }}
            />
          );
        }
        if (state().input?.shape === "number") {
          return (
            <input
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={state().input?.value}
              type="number"
              onChange={(event) => {
                store.handleValueChange(event.target.value);
              }}
            />
          );
        }
        if (state().input?.shape === "checkbox") {
          return (
            <div class="flex items-center">
              <input
                class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all cursor-pointer"
                checked={state().input?.value}
                type="checkbox"
                onChange={(event) => {
                  store.handleValueChange(event.target.checked);
                }}
              />
              <span class="ml-2 text-gray-700">{state().label}</span>
            </div>
          );
        }
        if (state().input?.shape === "select") {
          return (
            <select
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all cursor-pointer"
              value={state().input?.value}
              onChange={(event) => {
                store.handleValueChange(event.target.value);
              }}
            >
              <For each={state().input?.options}>
                {(option) => <option value={option.value}>{option.label}</option>}
              </For>
            </select>
          );
        }
        return null;
      })()}
    </div>
  );
}

function WorkoutActionArrayValuesView(props: { store: ArrayFieldCore<any> }) {
  const { store } = props;

  const [state, setState] = createSignal(store.state);

  store.onStateChange((v) => setState(v));

  return (
    <div class="w-full space-y-3 my-2">
      <div
        class="inline-flex items-center justify-center py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer text-sm font-medium"
        onClick={() => store.append()}
      >
        添加
      </div>
      <div class="space-y-3">
        <For each={state().fields}>
          {(field, index) => {
            const $inner = store.mapFieldWithIndex(index());
            if (!$inner) {
              return null;
            }
            return (
              <div class="p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
                <div class="flex justify-between items-center mb-2">
                  <div class="text-sm font-medium text-gray-500">
                    {field.label} {index() + 1}
                  </div>
                  <div class="flex items-center">
                    <div
                      onClick={() => {
                        store.insertBefore(field.id);
                      }}
                    >
                      在前面插入
                    </div>
                    <div
                      onClick={() => {
                        store.insertAfter(field.id);
                      }}
                    >
                      在后面插入
                    </div>
                    <div
                      class="text-red-500 hover:text-red-700 cursor-pointer p-1"
                      onClick={() => {
                        store.remove(field.id);
                      }}
                    >
                      <Trash class="w-4 h-4" />
                    </div>
                    <div
                      class="text-blue-500 hover:text-blue-700 cursor-pointer p-1"
                      onClick={() => {
                        store.upIdx(field.id);
                      }}
                    >
                      <ArrowUp class="w-4 h-4" />
                    </div>
                    <div
                      class="text-blue-500 hover:text-blue-700 cursor-pointer p-1"
                      onClick={() => {
                        store.downIdx(field.id);
                      }}
                    >
                      <ArrowDown class="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <Switch>
                  <Match when={$inner.field.symbol === "SingleFieldCore"}>
                    <WorkoutActionSingleValuesView store={$inner.field} />
                  </Match>
                  <Match when={$inner.field.symbol === "ArrayFieldCore"}>
                    <WorkoutActionArrayValuesView store={$inner.field} />
                  </Match>
                  <Match when={$inner.field.symbol === "ObjectFieldCore"}>
                    <WorkoutActionObjectValuesView store={$inner.field} />
                  </Match>
                </Switch>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}

export function WorkoutActionObjectValuesView(props: { store: ObjectFieldCore<any> }) {
  const { store } = props;

  const [state, setState] = createSignal(store.state);

  store.onStateChange((v) => setState(v));

  return (
    <div class="w-full space-y-4 my-2">
      <For each={state().fields}>
        {(field) => {
          if (field.hidden) {
            return null;
          }
          const $inner = store.mapFieldWithName(field.name);
          if (!$inner) {
            return null;
          }
          return (
            <div class="w-full">
              <div class="flex mb-2">
                <label class="block w-16 pt-2 mr-4 text-sm font-medium text-gray-700 mb-1 whitespace-nowrap">
                  {field.label}
                </label>
                <div class="flex-1 w-0">
                  {$inner.symbol === "ArrayFieldCore" ? (
                    <WorkoutActionArrayValuesView store={$inner} />
                  ) : $inner.symbol === "SingleFieldCore" ? (
                    <WorkoutActionSingleValuesView store={$inner} />
                  ) : $inner.symbol === "ObjectFieldCore" ? (
                    <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <WorkoutActionObjectValuesView store={$inner} />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
}

export function WorkoutActionValuesView(props: { store: ObjectFieldCore<any> }) {
  const { store } = props;

  return (
    <div class="w-[780px] mx-auto">
      <WorkoutActionObjectValuesView store={store} />
    </div>
  );
}
