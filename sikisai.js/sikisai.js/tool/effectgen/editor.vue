<script setup>
const onMounted = Vue.onMounted;
const useTemplateRef = Vue.useTemplateRef;
const ref = Vue.ref;
const reactive = Vue.reactive;
const computed = Vue.computed;

const canvas = useTemplateRef("canvas");
const textarea = useTemplateRef("textarea");

const useBackground = ref(true);

const effect = reactive({
  size: 128,
  radius1: 5,
  radius2: 50,
  gradient: [
    { pos: 0.0, color: "#FFFFFF", alpha: 1.0 },
    { pos: 0.05, color: "#DBDBDB", alpha: 1.0 },
    { pos: 0.25, color: "#808080", alpha: 1.0 },
    { pos: 0.4, color: "#4A4A4A", alpha: 1.0 },
    { pos: 0.45, color: "#424242", alpha: 1.0 },
    { pos: 1, color: "#000000", alpha: 1.0 },
  ],
});

onMounted(() => {
  redraw();
});

function redraw() {
  let x = 0;
  let y = 0;
  let w = effect.size;
  let h = effect.size;
  let hw = w / 2;
  let hh = h / 2;
  let r1 = effect.radius1;
  let r2 = effect.radius2;

  canvas.value.width = w;
  canvas.value.height = h;
  canvas.value.style.width = `${w}px`;
  canvas.value.style.height = `${h}px`;

  const ctx = canvas.value.getContext("2d");

  ctx.clearRect(x, y, w, h);
  ctx.beginPath();

  const gradient = ctx.createRadialGradient(
    x + hw,
    y + hh,
    r1,
    x + hw,
    y + hh,
    r2,
  );

  effect.gradient.forEach((g) => {
    let cr = parseInt(g.color.substring(1, 3), 16);
    let cg = parseInt(g.color.substring(3, 5), 16);
    let cb = parseInt(g.color.substring(5, 7), 16);
    gradient.addColorStop(
      g.pos,
      /*g.color*/ `rgba(${cr},${cg},${cb},${g.alpha})`,
    );
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, x + w, y + h);
}

function addPoint() {
  effect.gradient.push({ pos: 1, color: "#FFFFFF" });
  redraw();
}

function deletePoint(row) {
  effect.gradient = effect.gradient.filter((e) => e != row);
  redraw();
}

function movePoint(row, dir) {
  let idx = effect.gradient.indexOf(row);
  effect.gradient.splice(idx, 1);
  if (idx + dir < 0 || idx + dir >= effect.gradient.length) return;
  if (dir < 0) {
    effect.gradient.splice(idx - 1, 0, row);
  } else if (dir > 0) {
    effect.gradient.splice(idx + 1, 0, row);
  }
}

const json = computed(() => {
  return JSON.stringify(effect, null, "  ");
});

function applyDef() {
  let newEffect = JSON.parse(textarea.value.value);
  Object.assign(effect, newEffect);
  redraw();
}

function msg(val) {
  console.log(val);
}
</script>

<template>
  <div class="container">
    <div class="form">
      <label
        >size:
        <input v-model="effect.size" @change="redraw" />
      </label>
      <label
        >radius1:
        <input v-model="effect.radius1" @change="redraw" />
      </label>
      <label
        >radius2:
        <input v-model="effect.radius2" @change="redraw" />
      </label>
      <template v-for="(row, i) in effect.gradient">
        <div>
          <input v-model="row.pos" style="width:40px;">
          <input type="range" min="0" max="1.0" step="0.01" v-model="row.pos" @change="redraw">
          <input type="color" v-model="row.color" style="width:60px;" @change="redraw" />
          <input
            type="range"
            min="0"
            max="1.0"
            step="0.01"
            v-model="row.alpha"
            @change="redraw"
          />
          <button @click="deletePoint(row)">X</button>
          <button @click="movePoint(row, -1)">U</button>
          <button @click="movePoint(row, 1)">D</button>
        </div>
      </template>
      <button @click="addPoint">ADD POINT</button>
    </div>
    <div class="form">
      <label><input type="checkbox" v-model="useBackground">background</label>
      <canvas
        ref="canvas"
        id="canvas"
        :width="effect.size"
        :height="effect.size"
        :class="{ plaid: useBackground }"
      ></canvas>
    </div>
    <div>
      <textarea
        ref="textarea"
        :value="json"
        spellcheck="false"
        @change="applyDef"
      ></textarea>
    </div>
  </div>
</template>

<style>
.form-input {
  width: 80px;
}

canvas {
  border: solid 1px #333;
  margin: 5px;
}

.container {
  display:flex;
  flex-direction:row;
  align-items:flex-start;
}

.form {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  justify-content: flex-end;

  & button {
    font-size: 12px;
    background-color: #333;
    color: #FFF;
    outline: none;
    border: solid 1px #000;
    cursor: pointer;
  }

  & input {
    width: 80px;
    height: 16px;
    background-color: #222;
    color: #FFF;
    outline: none;
    border: solid 1px #000;
  }

  & input[type="color"] {
    height: 20px;
  }

  & input[type="checkbox"] {
    height: auto;
    width: auto;
  }
}

textarea {
  font-size: 12px;
  background-color: #222;
  color: #FFF;
  outline: none;
  border: solid 1px #000;
  width: 250px;
  height: 200px;
}

.plaid {
  background-color: #ffffff;
  background-image: linear-gradient(45deg, #000000bf 25%, transparent 25%, transparent 75%, #000000bf 75%), linear-gradient(45deg, #000000bf 25%, transparent 25%, transparent 75%, #000000bf 75%);
  background-position: 10px 10px, 20px 20px;
  background-size: 20px 20px;
}
</style>
