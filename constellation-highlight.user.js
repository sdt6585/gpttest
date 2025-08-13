// ==UserScript==
// @name         Constellation Calendar Project Highlight
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Highlight all calendar items from the same project on hover or long press/tap.
// @author       OpenAI Assistant
// @match        *://*/constellation-calendar.html
// @match        file:///*constellation-calendar.html
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const LONG_PRESS_MS = 500;
    const touchTimers = new WeakMap();

    function addHighlight(project) {
        removeHighlight();
        if (!project) return;
        document.querySelectorAll(`[data-project="${project}"]`).forEach(el => {
            el.classList.add('tm-project-highlight');
        });
    }

    function removeHighlight() {
        document.querySelectorAll('.tm-project-highlight').forEach(el => {
            el.classList.remove('tm-project-highlight');
        });
    }

    function handleEnter(e) {
        const project = e.currentTarget.dataset.project || getProjectText(e.currentTarget);
        addHighlight(project);
    }

    function handleLeave() {
        removeHighlight();
    }

    function getProjectText(el) {
        const projectEl = el.querySelector('.project');
        return projectEl ? projectEl.textContent.trim() : null;
    }

    function setupElement(el) {
        el.addEventListener('mouseenter', handleEnter);
        el.addEventListener('mouseleave', handleLeave);
        el.addEventListener('focus', handleEnter);
        el.addEventListener('blur', handleLeave);

        el.addEventListener('touchstart', e => {
            const timer = setTimeout(() => {
                handleEnter({ currentTarget: el });
                touchTimers.set(el, true);
            }, LONG_PRESS_MS);
            touchTimers.set(el, timer);
        }, { passive: true });

        ['touchend', 'touchcancel'].forEach(evt => {
            el.addEventListener(evt, () => {
                const timer = touchTimers.get(el);
                if (typeof timer === 'number') {
                    clearTimeout(timer);
                }
                if (touchTimers.get(el) === true) {
                    handleLeave();
                }
                touchTimers.delete(el);
            });
        });
    }

    function init() {
        document.querySelectorAll('.calendar-item, [data-project]').forEach(setupElement);
    }

    const style = document.createElement('style');
    style.textContent = `
        .tm-project-highlight {
            outline: 2px solid orange;
            background-color: rgba(255,165,0,0.2);
        }
    `;
    document.head.appendChild(style);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

