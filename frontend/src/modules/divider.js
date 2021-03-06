let A;
let B;
let vertical;
let dragging = false;
let notifySizeChange;

let state = {
    width: 50, // initial ratio (percentage)
    minWidth: 10, // min pixel width
    threshold: 15, // screen width percentage
};

function settings(key, value) {
    if (!key) return state;

    // key, value pairs
    const temp = {};
    if (key.constructor !== Object && value !== undefined) {
        temp[key] = value;
        key = { ...temp };
    }

    state = { ...state, key };
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
    A.classList.remove('hide-content');
    B.classList.remove('hide-content');
    vertical.classList.remove('hide-menu-left');
    vertical.classList.remove('hide-menu-right');

    if (width < threshold) {
        // 15 (100-85) (innerWidth - minWidth) / innerWidth
        percent = 100 * (minWidth / innerWidth);
        A.classList.add('hide-content');
        vertical.classList.add('hide-menu-left');
    }
    if (width > 100 - threshold) {
        percent = 100 - 100 * ((minWidth * 1.5) / innerWidth);
        B.classList.add('hide-content');
        vertical.classList.add('hide-menu-right');
    }

    A.style.width = `${percent}%`;
    B.style.width = `${100 - percent}%`;
    vertical.style.left = `${percent}%`;

    if (notifySizeChange) notifySizeChange(Number(percent));
}

const elements = {};
function update(id, html) {
    elements[id].innerHTML = html;
}

function onResize(fn) {
    notifySizeChange = fn;
}

function add(id) {
    // add a div element container to the sidebar
    // eg. the wordcounter
    const div = document.createElement('div'); // Create a text node
    div.id = id;
    div.className = `divider-${id}`;
    vertical.appendChild(div); // Append the text to <li>
    elements[id] = div;
}

function initialize(width, mouse) {
    vertical = document.querySelector('#vertical');
    A = document.querySelector('.paragraphs');
    B = document.querySelector('.sentences');

    vertical.onmousedown = () => (dragging = true);
    vertical.ondblclick = e => resize(e, 50);

    mouse(null, 'up', () => (dragging = false));
    mouse(null, 'move', resize);

    // save(options);
    state.width = width || 50;
    resize(null, state.width);

    console.log('resizer initialized');

    return { resize, settings, add, update, onResize };
}

export default initialize;
