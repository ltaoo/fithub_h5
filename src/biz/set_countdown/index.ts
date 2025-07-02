import dayjs from "dayjs";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { CountdownViewModel } from "@/biz/countdown";
import { StopwatchViewModel } from "@/biz/stopwatch";

export function SetCountdownViewModel(props: {
  /** 倒计时，单位秒 */
  countdown: number;
  /** 倒计时还剩多少毫秒 */
  remaining: number;
  /** 超出了多少毫秒 */
  exceed: number;
  /** 暂停时间 */
  finished_at: number;
  onStop?: () => void;
}) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const ui = {
    $countdown: CountdownViewModel({
      countdown: props.countdown,
      time: props.remaining,
      finished: !!props.finished_at,
    }),
    $stopwatch: StopwatchViewModel({ time: props.exceed }),
  };

  let _running = false;
  let _paused = !!props.finished_at;
  let _paused_at = props.finished_at ?? 0;
  let _state = {
    get running() {
      return _running;
    },
    get paused() {
      return _paused;
    },
    get remaining() {
      return ui.$countdown.time;
    },
    get exceed() {
      return ui.$stopwatch.time;
    },
    get paused_at() {
      return _paused_at;
    },
  };
  enum Events {
    Start,
    Stop,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Start]: true;
    [Events.Stop]: true;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$countdown.onStart(() => {
    console.log("[BIZ]workout_day/SetCountdown - countdown.onStart", _running, _paused);
    _running = true;
    _paused = false;
    bus.emit(Events.Start);
    methods.refresh();
  });
  ui.$countdown.onFinished(() => {
    console.log("[BIZ]workout_day/SetCountdown - countdown1.onFinished");
    ui.$stopwatch.start(new Date().valueOf());
  });
  ui.$countdown.onStop(() => {
    _running = false;
    _paused = true;
    bus.emit(Events.Stop);
    if (props.onStop) {
      props.onStop();
    }
    methods.refresh();
  });
  ui.$stopwatch.onStop(() => {
    _running = false;
    _paused = true;
    bus.emit(Events.Stop);
    if (props.onStop) {
      props.onStop();
    }
    methods.refresh();
  });

  return {
    ui,
    state: _state,
    start() {
      console.log("[BIZ]workout_day/SetCountdown - start", _running, _paused);
      ui.$countdown.start(new Date().valueOf());
      bus.emit(Events.StateChange, { ..._state });
    },
    pause() {
      console.log("[BIZ]workout_day/SetCountdown - pause", _paused);
      _paused_at = dayjs().valueOf();
      if (ui.$countdown.state.running) {
        ui.$countdown.pause();
        return;
      }
      ui.$stopwatch.pause();
    },
    /** 最后一组动作，没有倒计时，然后又新增了一组，倒计时出现，这时候希望它不能开始倒计时，就调用这个方法 */
    complete() {
      _paused = true;
      ui.$countdown.setComplete();
      methods.refresh();
    },
    setStartAt(v: number) {
      console.log("[BIZ]set_countdown - setStartAt", v, props.remaining, props.exceed, props.finished_at);
      ui.$countdown.setStartedAt(v);
      if (props.finished_at) {
        return;
      }
      const pass_milliseconds = dayjs().diff(v);
      const remaining = props.countdown * 1000 - pass_milliseconds;
      console.log("[BIZ]countdown - start2 ", pass_milliseconds);
      if (remaining >= 0) {
        // 还在倒计时
        ui.$countdown.recover(v);
        _running = true;
        methods.refresh();
      }
      if (remaining < 0) {
        // 超过倒计时了
        ui.$countdown.finish();
        ui.$stopwatch.setStartedAt(dayjs(v).add(props.countdown, "second").valueOf());
        ui.$stopwatch.play();
        _running = true;
        methods.refresh();
      }
      console.log("[]距离倒计时开始已过去", dayjs().diff(v, "minute"));
    },
    ready() {},
    onStart(handler: Handler<TheTypesOfEvents[Events.Start]>) {
      return bus.on(Events.Start, handler);
    },
    onStop(handler: Handler<TheTypesOfEvents[Events.Stop]>) {
      return bus.on(Events.Stop, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type SetCountdownViewModel = ReturnType<typeof SetCountdownViewModel>;
