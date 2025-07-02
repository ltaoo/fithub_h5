import { For, Show } from "solid-js";
import { Bird, ChevronDown, LoaderCircle, Play, PlayCircle } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { WorkoutActionCard } from "@/components/workout-action-card";
import { SetValueView } from "@/components/set-value-view";
import { BodyMusclePreview } from "@/components/body-muscle-preview";
import { Divider } from "@/components/divider";
import { TabHeader } from "@/components/ui/tab-header";
import { Button, ListView, ScrollView } from "@/components/ui";
import { VideoFullscreen } from "@/components/video-fullscreen";
import { Sheet } from "@/components/ui/sheet";

import { WorkoutActionProfileViewModel } from "@/biz/workout_action/workout_action";

import { WorkoutActionProfileTabHeader } from "./tabs";

export function WorkoutActionProfileView(props: { store: WorkoutActionProfileViewModel }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <>
      <div class="relative flex flex-col h-screen bg-w-bg-0">
        <Show when={state().loading}>
          <div class="absolute inset-0">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="flex items-center justify-center p-4 rounded-lg text-w-fg-0 bg-w-bg-5">
                <LoaderCircle class="w-8 h-8 animate-spin" />
              </div>
            </div>
          </div>
        </Show>
        <Show when={state().profile}>
          <div>
            <div class="p-4">
              <WorkoutActionCard {...state().profile!} />
            </div>
            <WorkoutActionProfileTabHeader store={vm.ui.$tab} />
          </div>
          <div class="flex-1 h-0 overflow-y-auto scroll--hidden">
            <Show when={state().curTabId === 1}>
              <div class="space-y-4 mt-4 p-2">
                <For each={state().profile?.steps}>
                  {(step, index) => {
                    return (
                      <div class="relative pl-6">
                        {/* Timeline dot and line */}
                        <div class="absolute left-0 top-1 w-4 h-4 rounded-full bg-w-fg-0"></div>
                        {index() < state().profile!.steps.length - 1 && (
                          <div
                            class="absolute left-[7px] top-4 w-0.5 h-full bg-w-fg-3"
                            // classList={{
                            //   "h-[80%]": index() === state().profile!.steps.length - 1,
                            // }}
                          ></div>
                        )}
                        <div class="rounded-lg">
                          <div class="flex flex-wrap gap-2">
                            <For each={step.tips}>
                              {(tip) => {
                                return <div class="bg-w-bg-3 rounded text-sm text-w-fg-0">{tip}</div>;
                              }}
                            </For>
                          </div>
                          <div class="text-w-fg-0">{step.text}</div>
                          <Show when={step.imgs.length}>
                            <div class="overflow-x-auto mt-4 pb-2">
                              <div class="flex gap-3 min-w-min">
                                <For each={step.imgs}>
                                  {(img) => {
                                    return (
                                      <div class="flex-shrink-0 w-[180px] h-[120px] rounded-lg overflow-hidden">
                                        <img class="w-full h-full object-cover" src={img} />
                                      </div>
                                    );
                                  }}
                                </For>
                              </div>
                            </div>
                          </Show>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>
              <Divider />
              <div class="p-4">
                <BodyMusclePreview store={vm.ui.$muscle} />
              </div>
            </Show>
            <Show when={state().curTabId === 2}>
              <div class="mt-4">
                <ScrollView store={vm.ui.$view_action_content}>
                  <ListView store={vm.request.workout_action_content.list} class="space-y-2 p-2">
                    <For each={state().contents}>
                      {(v) => {
                        return (
                          <div class="p-4 border-2 border-w-fg-3 rounded-lg">
                            <div class="text-w-fg-0">{v.title}</div>
                            <Show when={v.overview}>
                              <div class="text-w-fg-1 text-sm">{v.overview}</div>
                            </Show>
                            <div class="flex items-center justify-between  mt-4">
                              <div class="flex items-center gap-2">
                                <Show
                                  when={v.creator.avatar_url}
                                  fallback={<div class="w-[24px] h-[24px] rounded-full bg-w-bg-5"></div>}
                                >
                                  <div
                                    class="w-[24px] h-[24px] rounded-full"
                                    style={{
                                      "background-image": `url('${v.creator.avatar_url}')`,
                                      "background-size": "cover",
                                      "background-position": "center",
                                    }}
                                  ></div>
                                </Show>
                                <div class="text-sm text-w-fg-0">{v.creator.nickname}</div>
                              </div>
                              <div
                                class="flex items-center gap-2 p-2 rounded-full bg-w-bg-5"
                                onClick={() => {
                                  vm.methods.playVideo(v);
                                }}
                              >
                                <div class="text-blue-500">{v.time_text}</div>
                                <Play class="w-4 h-4 text-w-fg-0" />
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    </For>
                  </ListView>
                </ScrollView>
              </div>
            </Show>
            <Show when={state().curTabId === 3}>
              <Show
                when={state().histories.length}
                fallback={
                  <div class="mt-4 p-2">
                    <div class="w-full h-[360px] flex items-center justify-center">
                      <div class="flex flex-col items-center justify-center text-w-fg-1">
                        <Bird class="w-24 h-24 text-w-fg-1" />
                        <div class="mt-4 flex items-center space-x-2">
                          <div class="text-center text-xl">暂无数据</div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              >
                <div class="mt-4 p-2 space-y-2">
                  <For each={state().histories}>
                    {(v) => {
                      return (
                        <div class="">
                          <SetValueView
                            reps={v.reps}
                            reps_unit={v.reps_unit}
                            weight={v.weight}
                            weight_unit={v.weight_unit}
                          />
                          <div class="text-sm text-w-fg-1">{v.created_at_relative}</div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </Show>
            </Show>
            <div class="h-[68px]"></div>
            <div class="h-[40px]"></div>
            <div class="safe-height safe-height--no-color"></div>
          </div>
        </Show>
        <div class="absolute bottom-0 left-0 w-full">
          <div class="flex items-center gap-2 p-2 bg-w-bg-1 border-t border-w-fg-3">
            <div class="w-[40px] p-2 rounded-full bg-w-bg-5" onClick={() => vm.methods.cancel()}>
              <ChevronDown class="w-6 h-6 text-w-fg-0" />
            </div>
            <div class="flex-1 flex items-center gap-2"></div>
          </div>
          <div class="safe-height"></div>
        </div>
      </div>
      <Sheet ignore_safe_height store={vm.ui.$dialog_video} app={vm.app}>
        <VideoFullscreen
          store={vm.ui.$video}
          onClose={() => {
            vm.ui.$video.pause();
            vm.ui.$dialog_video.hide({ destroy: false });
          }}
        />
      </Sheet>
    </>
  );
}
