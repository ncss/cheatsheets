
class CopyElement extends HTMLElement {
  constructor() {
    super();

    this._root = this.attachShadow({mode: 'open'});
    this._root.innerHTML = `
<style>
code {
  font-family: 'Roboto Mono', monospace;
}
h1 {
  margin: 0;
}
#butterbar-holder {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  pointer-events: none;
  -webkit-user-select: none;
  user-select: none;
}
.butterbar {
  padding: 12px;
  margin: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column;
  background: rgba(68, 68, 68, 0.95);
  color: white;
  border-radius: 4px;
  max-width: calc(100% - 24px);
  min-width: 50%;
  min-height: 2em;
  font-weight: 300;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.25);
  transition: opacity 0s;
  font-size: 0.75em;
}
.butterbar h1 {
  font: inherit;
  opacity: 0.75;
}
.butterbar code {
  white-space: pre-wrap;
}
.butterbar:not(.show) {
  transition-duration: 0.25s;
  opacity: 0;
  pointer-events: none !important;
}

</style>
<div id="butterbar-holder">
  <div class="butterbar" id="copy">
    <h1>Copied&mdash;</h1>
    <code id="copy-code"></code>
    <input type="text" id="copier" style="opacity: 0;" readonly />
  </div>
</div>
    `;
    this._codeEl = this._root.getElementById('copy');
    this._copyCodeEl = this._root.getElementById('copy-code');
    this._copierEl = this._root.getElementById('copier');
    this._fade = 0;
  }

  /**
   * @param {string} data HTML content that may be indented
   * @return {string} unindented content
   */
  _trim(data) {
    let spacesToRemove = -1;
    const lines = data.split('\n').map((x) => {
      if (/^\s*$/.exec(x)) {
        return '';
      }
      const firstIndex = /\S/.exec(x).index;
      if (spacesToRemove === -1) {
        spacesToRemove = firstIndex;
      } else {
        spacesToRemove = Math.min(spacesToRemove, firstIndex);
      }
      return x;
    }).map((x) => {
      return x.substr(spacesToRemove);
    });
    return lines.join('\n').trim();
  }

  /**
   * @param {string} raw HTML content to copy to clipboard
   * @return {boolean} whether it was copied
   */
  copy(raw) {
    const content = this._trim(raw);
    if (!content) {
      return false;
    }

    window.clearTimeout(this._fade);
    this._fade = window.setTimeout(() => {
      this._codeEl.classList.remove('show');
    }, 2000);

    this._codeEl.classList.add('show');
    this._copyCodeEl.textContent = content;

    // const text = document.createElement('input');
    const text = this._copierEl;
    text.value = content;
    document.body.appendChild(text);
    text.select();
    console.debug('copied', content);
    document.execCommand('copy');
    text.remove();
    return true;
  }
}

window.customElements.define('copy-element', CopyElement);

/*
 * Adds a click handler for `figure.cheatsheet > code` elements, and copies them to the
 * clipboard. Shows the butterbar.
 */
document.body.addEventListener('click', (ev) => {
  const target = ev.target;
  if (!target || target.localName !== 'code') {
    return;
  }
  const p = target.parentNode;
  if (!p.matches('figure.cheatsheet')) {
    return;
  }

  let content = '';
  const toCopy = target.nextElementSibling;
  if (!toCopy) {
    return;
  }
  if (toCopy.localName === 'template') {
    const x = document.createElement('div');
    x.appendChild(toCopy.content.cloneNode(true));
    content = x.innerHTML;
  } else {
    content = toCopy.innerHTML;
  }

  if (!content) {
    return;
  }
  target.dispatchEvent(new CustomEvent('code', {bubbles: true, detail: content}));
});
