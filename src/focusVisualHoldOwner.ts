/** Owns the short-lived native visual copy across asynchronous mode changes. */
export class FocusVisualHoldOwner {
  private held = false;
  private acquiring: Promise<void> | null = null;
  private releasing: Promise<void> | null = null;
  private readonly begin: () => Promise<void>;
  private readonly end: () => Promise<void>;

  constructor(
    begin: () => Promise<void>,
    end: () => Promise<void>,
  ) {
    this.begin = begin;
    this.end = end;
  }

  async acquire(): Promise<void> {
    if (this.held || this.acquiring || this.releasing) {
      throw new Error("Focus visual hold is already in use");
    }
    const acquisition = this.begin();
    this.acquiring = acquisition;
    try {
      await acquisition;
      this.held = true;
    } finally {
      this.acquiring = null;
    }
  }

  async release(): Promise<void> {
    if (this.releasing) return this.releasing;
    if (this.acquiring) {
      try {
        await this.acquiring;
      } catch {
        return;
      }
    }
    if (!this.held) return;
    const release = this.end();
    this.releasing = release;
    try {
      await release;
      this.held = false;
    } finally {
      this.releasing = null;
    }
  }
}
