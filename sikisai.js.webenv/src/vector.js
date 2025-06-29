class Vector {
  static createRandom(n, min, max) {
    let v = new Vector(n);
    if (n >= 4) v.w = Math.random() * (max - min) + min;
    if (n >= 3) v.z = Math.random() * (max - min) + min;
    if (n >= 2) v.y = Math.random() * (max - min) + min;
    if (n >= 1) v.x = Math.random() * (max - min) + min;
    return v;
  }

  static create(x, y, z, w) {
    let n;
    if (x !== undefined) {
      n = 1;
    }
    if (y !== undefined) {
      n = 2;
    }
    if (z !== undefined) {
      n = 3;
    }
    if (w !== undefined) {
      n = 4;
    }
    return new Vector(n, [x, y, z, w]);
  }

  static $(x, y, z, w) {
    return Vector.create(x, y, z, w);
  }

  static zero(n) {
    return new Vector(n);
  }

  static toDeg(rad) {
    return (rad * 180.0) / Math.PI;
  }

  static toRad(deg) {
    return (deg * Math.PI) / 180.0;
  }

  static raddiff(r1, r2) {
    let pi2 = Math.PI * 2.0;
    let f1 = r1 - Math.floor(r1 / pi2) * pi2;
    let f2 = r2 - Math.floor(r2 / pi2) * pi2;
    let r3 = f1 - f2;
    let f3 = r3 - Math.floor(r3 / pi2) * pi2;
    if (f3 >= Math.PI) {
      f3 -= pi2;
    }
    return f3;
  }

  constructor(n = 2, defaultValues = [0.0, 0.0, 0.0, 0.0]) {
    if (n <= 0 || n > 4)
      throw new Error(`${n} dimension vector is not supported`);
    this.n = n;
    this.x = defaultValues[0] ?? 0.0;
    this.y = defaultValues[1] ?? 0.0;
    this.z = defaultValues[2] ?? 0.0;
    this.w = defaultValues[3] ?? 0.0;
  }

  checkDimension(b) {
    let a = this;
    if (a.n !== b.n) throw new Error("dimension not match");
  }

  clone() {
    let a = this;
    let b = new Vector(a.n);
    if (a.n >= 4) b.w = a.w;
    if (a.n >= 3) b.z = a.z;
    if (a.n >= 2) b.y = a.y;
    if (a.n >= 1) b.x = a.x;
    return b;
  }

  dup() {
    return this.clone();
  }

  add(b) {
    let a = this;
    this.checkDimension(b);
    a.x += b.x;
    a.y += b.y;
    a.z += b.z;
    a.w += b.w;
    return a;
  }

  sub(b) {
    let a = this;
    this.checkDimension(b);
    a.x -= b.x;
    a.y -= b.y;
    a.z -= b.z;
    a.w -= b.w;
    return a;
  }

  mult(k) {
    let a = this;
    a.x *= k;
    a.y *= k;
    a.z *= k;
    a.w *= k;
    return a;
  }

  div(k) {
    if (k === 0.0) throw new Error(`division by zero`);
    let a = this;
    a.x /= k;
    a.y /= k;
    a.z /= k;
    a.w /= k;
    return a;
  }

  normalize() {
    let a = this;
    let norm = a.norm();
    if (norm === 0.0) {
      return a;
    }
    return a.div(norm);
  }

  norm() {
    let a = this;
    if (this.n === 4)
      return Math.sqrt(a.x ** 2.0 + a.y ** 2.0 + a.z ** 2.0 + a.w ** 2.0);
    if (this.n === 3) return Math.sqrt(a.x ** 2.0 + a.y ** 2.0 + a.z ** 2.0);
    if (this.n === 2) return Math.sqrt(a.x ** 2.0 + a.y ** 2.0);
    if (this.n === 1) return Math.sqrt(a.x ** 2.0);
  }

  truncate(maxNorm) {
    let a = this;
    let norm = a.norm();
    if (norm > maxNorm) {
      a.normalize().mult(maxNorm);
    }
    return a;
  }

  dot(b) {
    let a = this;
    this.checkDimension(b);
    if (a.n === 2) {
      return a.x * b.x + a.y * b.y;
    } else {
      throw new Error(`dot product of ${a.n} dimension vector not supported`);
    }
  }

  cross(b) {
    let a = this;
    this.checkDimension(b);
    if (a.n === 2) {
      return a.x * b.y - a.y * b.x;
    } else {
      throw new Error(`cross product of ${a.n} dimension vector not supported`);
    }
  }

  val(x, y, z, w) {
    if (x !== undefined) this.x = x;
    if (y !== undefined) this.y = y;
    if (z !== undefined) this.z = z;
    if (w !== undefined) this.w = w;
    return this;
  }

  toArray() {
    let a = this;
    let r = [];
    if (this.n >= 4) r[3] = a.w;
    if (this.n >= 3) r[2] = a.z;
    if (this.n >= 2) r[1] = a.y;
    if (this.n >= 1) r[0] = a.x;
    return r;
  }

  fromArray(ary) {
    let a = this;
    if (this.n >= 4) a.w = ary[3];
    if (this.n >= 3) a.z = ary[2];
    if (this.n >= 2) a.y = ary[1];
    if (this.n >= 1) a.x = ary[0];
  }

  toLocal(pOrigin, theta) {
    /*
        -y
    
    -x  o> ---> t +x

        +y
    */
    let v = this.clone().sub(pOrigin);
    let lx = v.x * Math.cos(-theta) - v.y * Math.sin(-theta);
    let ly = v.x * Math.sin(-theta) + v.y * Math.cos(-theta);
    v.x = lx;
    v.y = ly;
    return v;
  }

  toWorld(pOrigin, theta) {
    let v = this.clone();
    let wx = v.x * Math.cos(theta) - v.y * Math.sin(theta);
    let wy = v.x * Math.sin(theta) + v.y * Math.cos(theta);
    v.x = wx;
    v.y = wy;
    v.add(pOrigin);
    return v;
  }

  map(fn) {
    let a = this;
    if (this.n >= 4) a.w = fn(a.w);
    if (this.n >= 3) a.z = fn(a.z);
    if (this.n >= 2) a.y = fn(a.y);
    if (this.n >= 1) a.x = fn(a.x);
    return a;
  }

  equal(b) {
    let a = this;
    if (this.n >= 1 && a.x !== b.x) return false;
    if (this.n >= 2 && a.y !== b.y) return false;
    if (this.n >= 3 && a.z !== b.z) return false;
    if (this.n >= 4 && a.w !== b.w) return false;
    return true;
  }

  rad() {
    return Math.atan2(this.y, this.x);
  }

  deg() {
    return (this.rad() * 180.0) / Math.PI;
  }

  rotate(theta) {
    let tx = this.x;
    let ty = this.y;
    let cos = Math.cos(theta);
    let sin = Math.sin(theta);
    this.x = tx * cos - ty * sin;
    this.y = tx * sin + ty * cos;
    return this;
  }

  setn(b) {
    let a = this;
    if (this.n >= 4) a.w = b.w;
    if (this.n >= 3) a.z = b.z;
    if (this.n >= 2) a.y = b.y;
    if (this.n >= 1) a.x = b.x;
    return a;
  }

  toString() {
    let a = this;
    let s = "[";
    if (this.n >= 1) s = s + a.x.toString();
    if (this.n >= 2) s = s + "," + a.y.toString();
    if (this.n >= 3) s = s + "," + a.z.toString();
    if (this.n >= 4) s = s + "," + a.w.toString();
    s = s + "]";
    return s;
  }
}

export default {
  Vector: Vector,
};
