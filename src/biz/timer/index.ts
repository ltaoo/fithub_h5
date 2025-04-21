/**
 * @file 秒表
 */
import { base, Handler } from "@/domains/base";

export function TimerViewModel(props: { onRefresh?: (text: string) => void }) {
  let _is_running = false;
  let _time = 0;
  let _time_text = "00:00.00";
  let _minutes1 = "0";
  let _minutes2 = "0";
  let _seconds1 = "0";
  let _seconds2 = "0";
  let _ms1 = "0";
  let _ms2 = "0";
  let _ms3 = "0";
  let start_time: number;
  let animation_frame_id: number;
  let previous_time: number | undefined;

  let _state = {
    get time() {
      return _time;
    },
    get time_text() {
      return _time_text;
    },
    get minutes1() {
      return _minutes1;
    },
    get minutes2() {
      return _minutes2;
    },
    get seconds1() {
      return _seconds1;
    },
    get seconds2() {
      return _seconds2;
    },
    get ms1() {
      return _ms1;
    },
    get ms2() {
      return _ms2;
    },
    get ms3() {
      return _ms3;
    },
    get is_running() {
      return _is_running;
    },
  };

  enum Events {
    Start,
    Finish,
    Stop,
    Reset,
    StateChange,
  }

  type TheTypesOfEvents = {
    [Events.Start]: void;
    [Events.Finish]: void;
    [Events.Stop]: void;
    [Events.Reset]: void;
    [Events.StateChange]: typeof _state;
  };

  const bus = base<TheTypesOfEvents>();

  function format_time(time: number) {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor(time % 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds
      .toString()
      .padStart(3, "0")}`;
  }

  function tick(timestamp: number) {
    if (!_is_running) {
      return;
    }

    if (!previous_time) {
      previous_time = timestamp;
    }

    const delta_time = timestamp - previous_time;
    previous_time = timestamp;
    _time = _time + delta_time;
    _time_text = format_time(_time);

    _minutes1 = _time_text[0];
    _minutes2 = _time_text[1];
    _seconds1 = _time_text[3];
    _seconds2 = _time_text[4];
    _ms1 = _time_text[6];
    _ms2 = _time_text[7];
    _ms3 = _time_text[8];
    //     const { minutes, seconds, milliseconds } = props.store.state;
    //     if ($minutes1 && $minutes2) {
    //       $minutes1.innerText = Math.floor(minutes / 10).toString();
    //       $minutes2.innerText = (minutes % 10).toString();
    //     }
    //     if ($seconds1 && $seconds2) {
    //       $seconds1.innerText = Math.floor(seconds / 10).toString();
    //       $seconds2.innerText = (seconds % 10).toString();
    //     }
    //     if ($ms1 && $ms2) {
    //       $ms1.innerText = Math.floor(milliseconds / 10).toString();
    //       $ms2.innerText = (milliseconds % 10).toString();
    //     }

    bus.emit(Events.StateChange, { ..._state });
    animation_frame_id = requestAnimationFrame(tick);
  }

  return {
    state: _state,
    ready() {},
    start() {
      if (_is_running) {
        return;
      }
      _is_running = true;
      previous_time = undefined;
      animation_frame_id = requestAnimationFrame(tick);
      bus.emit(Events.Start);
    },
    stop() {
      if (!_is_running) {
        return;
      }
      cancelAnimationFrame(animation_frame_id);
      _is_running = false;
      _time = 0;
      _time_text = "00:00.00";
      _minutes1 = "0";
      _minutes2 = "0";
      _seconds1 = "0";
      _seconds2 = "0";
      _ms1 = "0";
      _ms2 = "0";
      _ms3 = "0";
      previous_time = undefined;
      bus.emit(Events.Stop);
    },
    reset() {
      const was_running = _is_running;
      if (was_running) {
        this.stop();
      }
      _time = 0;
      if (was_running) {
        this.start();
      }
      bus.emit(Events.Reset);
    },
    onStart(handler: Handler<TheTypesOfEvents[Events.Start]>) {
      return bus.on(Events.Start, handler);
    },
    onFinish(handler: Handler<TheTypesOfEvents[Events.Finish]>) {
      return bus.on(Events.Finish, handler);
    },
    onStop(handler: Handler<TheTypesOfEvents[Events.Stop]>) {
      return bus.on(Events.Stop, handler);
    },
    onReset(handler: Handler<TheTypesOfEvents[Events.Reset]>) {
      return bus.on(Events.Reset, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type TimerViewModel = ReturnType<typeof TimerViewModel>;
