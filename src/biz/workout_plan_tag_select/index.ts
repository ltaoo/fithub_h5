import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { MultipleSelectionCore } from "@/domains/multiple";
import { ButtonCore, DialogCore } from "@/domains/ui";

export function WorkoutPlanTagSelectViewModel() {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    select(tag: string) {
      (() => {
        if (_tmp_selected_tags.includes(tag)) {
          _tmp_selected_tags = _tmp_selected_tags.filter((v) => v !== tag);
          return;
        }
        _tmp_selected_tags.push(tag);
      })();
      methods.refresh();
    },
    clear() {
      _selected_tags = [];
      _tmp_selected_tags = [];
      methods.refresh();
    },
    showDialog() {
      _tmp_selected_tags = [..._selected_tags];
      ui.$dialog.show();
      methods.refresh();
    },
    submit() {
      _selected_tags = [..._tmp_selected_tags];
      ui.$dialog.hide();
      methods.refresh();
    },
    cancel() {
      ui.$dialog.hide();
    },
  };
  const ui = {
    $dialog: new DialogCore({
      onCancel() {
        methods.refresh();
      },
    }),
    // $select: new MultipleSelectionCore<string>({
    //   defaultValue: [],
    //   options: [],
    // }),
    $btn_submit: new ButtonCore({
      onClick() {
        methods.submit();
      },
    }),
  };
  let _tag_groups = [
    {
      title: "锻炼部位",
      options: [
        {
          label: "胸",
          value: "胸",
        },
        {
          label: "背",
          value: "背",
        },
        {
          label: "肩",
          value: "肩",
        },
        {
          label: "手臂",
          value: "手臂",
        },
        {
          label: "臀",
          value: "臀",
        },
        {
          label: "下肢",
          value: "下肢",
        },
        {
          label: "核心",
          value: "核心",
        },
        {
          label: "心肺",
          value: "心肺",
        },
      ],
    },
    {
      title: "分化",
      options: [
        {
          label: "两分化",
          value: "两分化",
        },
        {
          label: "三分化",
          value: "三分化",
        },
        {
          label: "四分化",
          value: "四分化",
        },
        {
          label: "五分化",
          value: "五分化",
        },
      ],
    },
    {
      title: "强度",
      options: [
        {
          label: "低强度",
          value: "低强度",
        },
        {
          label: "中强度",
          value: "中强度",
        },
        {
          label: "高强度",
          value: "高强度",
        },
        {
          label: "冲击PR",
          value: "冲击PR",
        },
        {
          label: "耐力",
          value: "耐力",
        },
      ],
    },
    {
      title: "适宜人群",
      options: [
        {
          label: "新手",
          value: "新手",
        },
        {
          label: "有一定经验",
          value: "有一定经验",
        },
        {
          label: "经验丰富",
          value: "经验丰富",
        },
      ],
    },
  ];
  let _selected_tags: string[] = [];
  let _tmp_selected_tags: string[] = [];
  let _state = {
    get value() {
      return _selected_tags;
    },
    get tagGroups() {
      return _tag_groups.map((group) => {
        return {
          title: group.title,
          options: group.options.map((opt) => {
            return {
              label: opt.label,
              value: opt.value,
              selected: _tmp_selected_tags.includes(opt.value),
            };
          }),
        };
      });
    },
  };
  enum Events {
    Change,
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.Change]: typeof _selected_tags;
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    ui,
    state: _state,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type WorkoutPlanTagSelectViewModel = ReturnType<typeof WorkoutPlanTagSelectViewModel>;
