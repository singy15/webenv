class MathUtil {
  static intersect(p1, q1, p2, q2) {
    function orientation(p, q, r) {
      let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
      if (val === 0) return 0;
      return val > 0 ? 1 : 2;
    }

    function onSegment(p, q, r) {
      if (
        q.x <= Math.max(p.x, r.x) &&
        q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) &&
        q.y >= Math.min(p.y, r.y)
      ) {
        return true;
      }
      return false;
    }

    let o1 = orientation(p1, q1, p2);
    let o2 = orientation(p1, q1, q2);
    let o3 = orientation(p2, q2, p1);
    let o4 = orientation(p2, q2, q1);

    if (o1 !== o2 && o3 !== o4) {
      return true;
    }

    if (o1 === 0 && onSegment(p1, p2, q1)) return true;
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;

    return false;
  }

  parallel(p1, p2, p3, p4) {
    function slope(p, q) {
      if (p.x === q.x) {
        return Infinity;
      }
      return (q.y - p.y) / (q.x - p.x);
    }

    let slope1 = slope(p1, p2);
    let slope2 = slope(p3, p4);

    return slope1 === slope2;
  }
}

export default {
  MathUtil: MathUtil,
};
