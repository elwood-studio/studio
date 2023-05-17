import type {
  WorkflowRunnerRuntimeTimer,
  WorkflowRunnerRuntimeTimerReport,
} from '../types';

export class RuntimeTimer implements WorkflowRunnerRuntimeTimer {
  #startTime: bigint = BigInt(0);
  #endTime: bigint = BigInt(0);
  #startTs: Date | null = null;
  #endTs: Date | null = null;

  get startTime() {
    return this.#startTime;
  }

  get endTime() {
    return this.#endTime;
  }

  report(): WorkflowRunnerRuntimeTimerReport {
    return {
      start: String(this.startTime),
      end: String(this.endTime),
      elapsedNanoseconds: String(this.endTime - this.startTime),
      startTimestamp: this.#startTs?.toISOString() ?? '',
      endTimestamp: this.#endTs?.toISOString() ?? '',
    };
  }

  start() {
    this.#startTime = process.hrtime.bigint();
    this.#startTs = new Date();
  }

  stop() {
    this.#endTime = process.hrtime.bigint();
    this.#endTs = new Date();
  }
}
