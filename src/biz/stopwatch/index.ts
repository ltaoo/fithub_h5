/**
 * @file 秒表
 */
import { base, Handler } from "@/domains/base";

export function StopwatchViewModel(props: {
  /** 已过去的时间，用于从后端恢复计时。毫秒数 */
  time?: number;
  onRefresh?: (text: string) => void;
}) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    play() {
      methods.start(_started_at !== 0 ? _started_at : new Date().valueOf(), {
        is_resume: _started_at !== 0,
      });
    },
    start(started_at: number, extra: Partial<{ is_resume: boolean }> = {}) {
      if (_is_running) {
        return;
      }
      // if (_is_interrupt && props.countdown !== undefined) {
      //   _time = props.countdown;
      // }
      _started_at = started_at;
      _is_pending = false;
      _is_running = true;
      _is_completed = false;
      _previous_time = undefined;
      _animation_frame_id = requestAnimationFrame(tick);
      if (!extra.is_resume) {
        bus.emit(Events.Start);
      }
      if (extra.is_resume) {
        bus.emit(Events.Resume);
      }
      methods.refresh();
    },
    finish() {
      //       console.log("[BIZ]countdown - finish", _is_running);
      // if (!_is_running) {
      //   return;
      // }
      if (_time === 0) {
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
      _previous_time = undefined;
      _is_completed = true;
      bus.emit(Events.Completed, { time: new Date().valueOf() / 1000 });
      bus.emit(Events.Finished);
      methods.refresh();
    },
    pause() {
      //       console.log("[BIZ]countdown - pause", _is_running);
      if (!_is_running) {
        return;
      }
      _is_running = false;
      _is_paused = true;
      cancelAnimationFrame(_animation_frame_id);
      bus.emit(Events.Stop);
      bus.emit(Events.Finished);
      methods.refresh();
    },
    toggle() {
      //       console.log("[BIZ]countdown - toggle", _is_running);
      if (_is_running) {
        methods.pause();
        return;
      }
      methods.play();
    },
    /** 分段 */
    segment() {
      _segments.unshift({
        idx: _segments.length + 1,
        text: _time_text,
      });
      methods.refresh();
    },
    reset() {
      _time = (() => {
        if (props.time) {
          return props.time;
        }
        return 0;
      })();
      _segments = [];
      refresh_time_text(_time);
      bus.emit(Events.Reset);
      methods.refresh();
    },
    setStartedAt(v: number) {
      _time = new Date().valueOf() - v;
      refresh_time_text(_time);
      // console.log("[BIZ]stopwatch - setStartedAt", v, _time, _time_text);
      methods.refresh();
      // tick(new Date().valueOf(), { force: true });
    },
    addSeconds(seconds: number) {
      _time += seconds * 1000;
      methods.refresh();
    },
    subSeconds(seconds: number) {
      _time -= seconds * 1000;
      methods.refresh();
    },
    format_time(time: number) {
      const hours = Math.floor(time / 3600000);
      const minutes = Math.floor((time % 3600000) / 60000);
      const seconds = Math.floor((time % 60000) / 1000);
      const milliseconds = Math.floor(time % 1000);
      const h = hours.toString().padStart(2, "0");
      const m = minutes.toString().padStart(2, "0");
      const s = seconds.toString().padStart(2, "0");
      const ms = milliseconds.toString().padStart(2, "0").slice(0, 2);
      const r = {
        hours: {
          v: hours,
          a: h[0],
          b: h[1],
        },
        minutes: {
          v: minutes,
          a: m[0],
          b: m[1],
        },
        seconds: {
          v: seconds,
          a: s[0],
          b: s[1],
        },
        milliseconds: {
          v: milliseconds,
          a: ms[0],
          b: ms[1],
        },
        text: `${m}:${s}.${ms}`,
      };
      return r;
    },
  };

  /** 等待中 */
  let _is_pending = true;
  /** 进行中 */
  let _is_running = false;
  /** 已暂停 */
  let _is_paused = false;
  /** 已结束 */
  let _is_completed = false;
  /** 是否从暂停恢复到开始倒计时 */
  let _is_resume = false;
  /** 开始倒计时的时间戳 */
  let _started_at = 0;
  /** 倒计时的毫秒数 */
  let _time = (() => {
    if (props.time) {
      return props.time;
    }
    if (_is_completed) {
      return 0;
    }
    return 0;
  })();
  let _time_text = "00:00.00";
  let _hours1 = "0";
  let _hours2 = "0";
  let _minutes1 = "0";
  let _minutes2 = "0";
  let _seconds1 = "0";
  let _seconds2 = "0";
  let _ms1 = "0";
  let _ms2 = "0";
  let _ms3 = "0";
  let _animation_frame_id: number;
  let _previous_time: number | undefined;
  let _percent = 100;
  let _segments: { idx: number; text: string }[] = [];

  let _state = {
    get pending() {
      return _is_pending;
    },
    get running() {
      return _is_running;
    },
    /** 是否手动暂停 */
    get paused() {
      return _is_paused;
    },
    get completed() {
      return _is_completed;
    },
    get time() {
      return _time;
    },
    get time_text() {
      return _time_text;
    },
    get hours1() {
      return _hours1;
    },
    get hours2() {
      return _hours2;
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
    get segments() {
      return _segments;
    },
  };

  enum Events {
    Start,
    /** 正常倒计时终止 */
    Finished,
    /** 暂停 */
    Stop,
    /** 结束，包括正常结束和暂停 */
    Completed,
    /** 从暂停到恢复执行 */
    Resume,
    /** 重置时间 */
    Reset,
    StateChange,
  }

  type TheTypesOfEvents = {
    [Events.Start]: void;
    [Events.Finished]: void;
    [Events.Stop]: void;
    [Events.Completed]: { time: number };
    [Events.Resume]: void;
    [Events.Reset]: void;
    [Events.StateChange]: typeof _state;
  };

  const bus = base<TheTypesOfEvents>();

  function refresh_time_text(time: number) {
    const time_text = methods.format_time(time);
    _time_text = time_text.text;
    _hours1 = time_text.hours.a;
    _hours2 = time_text.hours.b;
    _minutes1 = time_text.minutes.a;
    _minutes2 = time_text.minutes.b;
    _seconds1 = time_text.seconds.a;
    _seconds2 = time_text.seconds.b;
    _ms1 = time_text.milliseconds.a;
    _ms2 = time_text.milliseconds.b;
  }
  function tick(timestamp: number, extra: Partial<{ force: boolean }> = {}) {
    if (!_is_running && !extra.force) {
      return;
    }
    if (!_previous_time) {
      _previous_time = timestamp;
    }
    const delta_time = timestamp - _previous_time;
    // console.log("[BIZ]stopwatch - tick", delta_time, _time);
    _previous_time = timestamp;
    _time = _time + delta_time;
    refresh_time_text(_time);
    _animation_frame_id = requestAnimationFrame(tick);
    methods.refresh();
  }

  refresh_time_text(_time);

  return {
    state: _state,
    get time() {
      return _time;
    },
    ready() {},
    play: methods.play,
    pause: methods.pause,
    toggle: methods.toggle,
    start: methods.start,
    finish: methods.finish,
    reset: methods.reset,
    segment: methods.segment,
    setStartedAt: methods.setStartedAt,
    addSeconds: methods.addSeconds,
    subSeconds: methods.subSeconds,
    destroy() {
      cancelAnimationFrame(_animation_frame_id);
    },
    /** 倒计时开始 */
    onStart(handler: Handler<TheTypesOfEvents[Events.Start]>) {
      return bus.on(Events.Start, handler);
    },
    /** 倒计时终止 */
    onFinished(handler: Handler<TheTypesOfEvents[Events.Finished]>) {
      return bus.on(Events.Finished, handler);
    },
    /** 倒计时暂停 */
    onStop(handler: Handler<TheTypesOfEvents[Events.Stop]>) {
      return bus.on(Events.Stop, handler);
    },
    /** 倒计时暂停或终止 */
    onCompleted(handler: Handler<TheTypesOfEvents[Events.Completed]>) {
      return bus.on(Events.Completed, handler);
    },
    /** 倒计时从暂停到开始 */
    onResume(handler: Handler<TheTypesOfEvents[Events.Resume]>) {
      return bus.on(Events.Resume, handler);
    },
    /** 倒计时重置 */
    onReset(handler: Handler<TheTypesOfEvents[Events.Reset]>) {
      return bus.on(Events.Reset, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type StopWatchViewModel = ReturnType<typeof StopwatchViewModel>;
