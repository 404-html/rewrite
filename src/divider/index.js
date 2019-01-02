import u from "../utilities";

let A;
let B;
let left;
let vertical;
let dragging = false;
const { read, write } = u.storage("resizer");

let state = Object.assign(
  {},
  {
    width: 50, // initial ratio (percentage)
    minWidth: 8, // min pixel width
    threshold: 20, // screen width percentage

    // DOM fixtures
    vertical: "#vertical",
    document: ".document",
    sentences: ".sentences"
  },
  read()
);

function save(obj = {}) {
  const data = { ...state, ...obj };
  write(data);
  return obj;
}

function settings(key, value) {
  if (!key) return;

  // key, value pairs
  const temp = {};
  if (key.constructor !== Object && value !== undefined) {
    temp[key] = value;
    key = { ...temp };
  }

  state = { ...state, key };
  return save(state);
}

function resize(e, value) {
  if (!dragging && !value) return;

  let { pageX } = e || {};

  if (e) {
    // prevent cursor selecting during drag
    e.stopPropagation && e.stopPropagation();
    e.preventDefault && e.preventDefault();
    e.cancelBubble = true;
    e.returnValue = false;
  }

  const { threshold, minWidth } = state;
  const { innerWidth } = window;

  pageX = pageX || ((value || 50) / 100) * innerWidth;
  let width = value || Number((pageX / innerWidth) * 100);
  width = Math.max(minWidth, width);
  width = Math.min(100 - minWidth, width);

  let percent = width;
  A.classList.remove("hide-content");
  B.classList.remove("hide-content");
  vertical.classList.remove("hide-menu-left");
  vertical.classList.remove("hide-menu-right");

  if (width < threshold) {
    // 15 (100-85) (innerWidth - minWidth) / innerWidth
    percent = 100 * (minWidth / innerWidth);
    A.classList.add("hide-content");
    vertical.classList.add("hide-menu-left");
  }
  if (width > 100 - threshold) {
    percent = 100 - 100 * ((minWidth * 1.5) / innerWidth);
    B.classList.add("hide-content");
    vertical.classList.add("hide-menu-right");
  }

  A.style.width = `${percent}%`;
  B.style.width = `${100 - percent}%`;
  vertical.style.left = `${percent}%`;

  save({ width: Number(percent) });
}

function bindMenuEvents() {
  left.onclick = e => {
    const { nodeName, dataset } = e.target;
    if (nodeName !== "LI") return;
    console.log(nodeName, dataset.fn);
    const fn = dataset.fn;
    window.RE.article[fn]();
  };
}

function initialize(options = {}) {
  vertical = document.querySelector(state.vertical);
  left = document.querySelector("#left-menu");
  A = document.querySelector(state.document);
  B = document.querySelector(state.sentences);

  bindMenuEvents();

  vertical.onmousedown = () => (dragging = true);
  vertical.ondblclick = e => resize(e, 50);

  window.onmouseup = () => {
    dragging = false;
    console.log("WINDOW [%s]", state.width);
  };

  window.onmousemove = resize;

  save(options);
  resize(null, state.width);

  console.log("resizer initialized");

  return { resize, settings };
}

export default initialize;
