/**
 * @file 倒计时
 */
import { base, Handler } from "@/domains/base";

export function CountdownViewModel(props: {
  countdown?: number;
  time?: number;
  finished?: boolean;
  onRefresh?: (text: string) => void;
}) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    start(started_at: number) {
      if (_is_running) {
        return;
      }
      if (_is_interrupt && props.countdown !== undefined) {
        _time = props.countdown;
      }
      _started_at = started_at;
      _is_pending = false;
      _is_running = true;
      _is_finished = false;
      previous_time = undefined;
      _animation_frame_id = requestAnimationFrame(tick);
      bus.emit(Events.Start);
      bus.emit(Events.StateChange, { ..._state });
    },
    finish() {
      if (!_is_running) {
        return;
      }
      cancelAnimationFrame(_animation_frame_id);
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
      _is_finished = true;
      bus.emit(Events.Finish, { time: new Date().valueOf() / 1000 });
      bus.emit(Events.Completed);
      bus.emit(Events.StateChange, { ..._state });
    },
    interrupt() {
      if (!_is_running) {
        return;
      }
      _is_running = false;
      _is_interrupt = true;
      cancelAnimationFrame(_animation_frame_id);
      bus.emit(Events.Stop);
      bus.emit(Events.Completed);
      bus.emit(Events.StateChange, { ..._state });
    },
    reset() {
      const was_running = _is_running;
      if (was_running) {
        // this.reset();
      }
      _time = 0;
      if (was_running) {
        this.start(new Date().valueOf());
      }
      bus.emit(Events.Reset);
    },
    pause() {
      cancelAnimationFrame(_animation_frame_id);
    },
    setStartedAt(v: number) {
      _is_running = true;
      _started_at = v;
    },
    play() {
      if (!_is_running) {
        methods.start(_started_at !== 0 ? _started_at : new Date().valueOf());
        return;
      }
      console.log("_time and started at", _started_at, _time);
      _time = new Date().valueOf() - _started_at;
      console.log("_time and started at 2", _started_at, _time);
      if (_time > 99 * 60 * 1000) {
        refresh(99 * 60 * 1000);
        bus.emit(Events.StateChange, { ..._state });
        return;
      }
      _animation_frame_id = requestAnimationFrame(tick);
    },
    addSeconds(seconds: number) {
      _time += seconds * 1000;
      bus.emit(Events.StateChange, { ..._state });
    },
    subSeconds(seconds: number) {
      _time -= seconds * 1000;
      bus.emit(Events.StateChange, { ..._state });
    },
  };

  /** 等待中 */
  let _is_pending = props.finished ? false : true;
  /** 进行中 */
  let _is_running = false;
  /** 已结束 */
  let _is_finished = props.finished ?? false;
  /** 已暂停 */
  let _is_interrupt = false;

  let _started_at = 0;
  let _time = (() => {
    if (props.time) {
      return props.time;
    }
    if (_is_finished) {
      return 0;
    }
    if (props.countdown !== undefined) {
      return props.countdown * 1000;
    }
    return 0;
  })();
  let _time_text = format_time(_time);
  let _extra_time = 0;
  let _extra_time_text = format_time(_extra_time);

  let _minutes1 = _time_text[0];
  let _minutes2 = _time_text[1];
  let _seconds1 = _time_text[3];
  let _seconds2 = _time_text[4];
  let _ms1 = _time_text[6];
  let _ms2 = _time_text[7];
  let _ms3 = _time_text[8];

  let _percent = 100;
  let start_time: number;
  let _animation_frame_id: number;
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
    get pending() {
      return _is_pending;
    },
    get is_running() {
      return _is_running;
    },
    get finished() {
      return _is_finished;
    },
  };

  enum Events {
    Start,
    /** 正常结束 */
    Finish,
    /** 提前终止 */
    Stop,
    /** 完成，包括正常结束和提前终止 */
    Completed,
    /** 重置时间 */
    Reset,
    StateChange,
  }

  type TheTypesOfEvents = {
    [Events.Start]: void;
    [Events.Finish]: { time: number };
    [Events.Stop]: void;
    [Events.Completed]: void;
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
  function refresh(time: number) {
    _time_text = format_time(time);

    _minutes1 = _time_text[0];
    _minutes2 = _time_text[1];
    _seconds1 = _time_text[3];
    _seconds2 = _time_text[4];
    _ms1 = _time_text[6];
    _ms2 = _time_text[7];
    _ms3 = _time_text[8];
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
    _time = props.countdown !== undefined ? _time - delta_time : _time + delta_time;

    refresh(_time);

    if (props.countdown !== undefined) {
      if (_time <= 0) {
        methods.finish();
      }
    }
    _animation_frame_id = requestAnimationFrame(tick);

    bus.emit(Events.StateChange, { ..._state });
  }

  return {
    state: _state,
    ready() {},
    start: methods.start,
    finish: methods.finish,
    interrupt: methods.interrupt,
    pause: methods.pause,
    play: methods.play,
    setStartedAt: methods.setStartedAt,
    addSeconds: methods.addSeconds,
    subSeconds: methods.subSeconds,
    get time() {
      return _time;
    },
    onStart(handler: Handler<TheTypesOfEvents[Events.Start]>) {
      return bus.on(Events.Start, handler);
    },
    onFinish(handler: Handler<TheTypesOfEvents[Events.Finish]>) {
      return bus.on(Events.Finish, handler);
    },
    onComplete(handler: Handler<TheTypesOfEvents[Events.Completed]>) {
      return bus.on(Events.Completed, handler);
    },
    onReset(handler: Handler<TheTypesOfEvents[Events.Reset]>) {
      return bus.on(Events.Reset, handler);
    },
    onStop(handler: Handler<TheTypesOfEvents[Events.Stop]>) {
      return bus.on(Events.Stop, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type CountdownViewModel = ReturnType<typeof CountdownViewModel>;
