class CollectionUtil {
  constructor() {}

  static maxBy(ary, fn) {
    let max = null;
    let rs = [];
    ary.forEach((e) => {
      let v = fn(e);
      if (max == null || max < v) {
        max = v;
        rs = [e];
      } else if (max === v) {
        rs.push(e);
      }
    });
    return rs;
  }

  static minBy(ary, fn) {
    let min = null;
    let rs = [];
    ary.forEach((e) => {
      let v = fn(e);
      if (min == null || min > v) {
        min = v;
        rs = [e];
      } else if (min === v) {
        rs.push(e);
      }
    });
    return rs;
  }

  static sample(ary) {
    let sampleIndex = Math.floor(Math.random(1.0) * ary.length);
    return ary.length > 0 ? ary[sampleIndex] : null;
  }
}

export default {
  CollectionUtil: CollectionUtil,
};
