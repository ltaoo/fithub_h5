import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { CountdownViewModel } from "@/biz/countdown";
import { StopwatchViewModel } from "@/biz/stopwatch";

export function SetCountdownViewModel(props: {
  countdown: number;
  remaining: number;
  exceed: number;
  finished: boolean;
  onStop?: () => void;
}) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const ui = {
    $countdown: CountdownViewModel({ countdown: props.countdown, time: props.remaining, finished: props.finished }),
    $stopwatch: StopwatchViewModel({ time: props.exceed }),
  };

  let _running = false;
  let _paused = false;
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
      if (ui.$countdown.state.running) {
        ui.$countdown.pause();
        return;
      }
      ui.$stopwatch.pause();
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
