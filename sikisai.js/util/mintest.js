class MintestAssertionError extends Error {
  constructor(msg) {
    super(msg);
    this.msg = msg;
  }
}

class Mintest {
  static {
    this.RunTest = true;
    this.Report = {
      results: [],
    };
    this.PrintOnTestError = true;
  }

  static test(name, fn) {
    try {
      fn();
      Mintest.Report.results.push({ name: name, status: "success" });
    } catch (e) {
      if (e instanceof MintestAssertionError) {
        Mintest.Report.results.push({
          name: name,
          status: "failed",
          assertError: e.msg,
        });
        Mintest.printTestError(name, e.msg);
      } else {
        Mintest.Report.results.push({ name: name, status: "error", error: e });
        Mintest.printTestError(name, e);
      }
    }
  }

  static printTestError(name, cause) {
    if (!Mintest.PrintOnTestError) return;
    console.error(name, cause);
  }

  static assert(msg, val) {
    if (!val) {
      throw new MintestAssertionError(msg);
    }
  }

  static clearReport() {
    Mintest.Report = {
      results: [],
    };
  }
}

export default {
  Mintest,
};
