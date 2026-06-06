/**
 * ============================================================
 *  03-components.js — UI Component Interactions
 *  Depends on: 01-tokens.css, 02-components.css
 *
 *  Modules:
 *  1.  Theme (Dark/Light toggle)
 *  2.  Modal
 *  3.  Toast
 *  4.  Dropdown
 *  5.  Tabs
 *  6.  Accordion
 *  7.  Form Validation
 *  8.  Auto-init (data-api)
 * ============================================================
 */

(function (global) {
  'use strict';

  /* ============================================================
     UTILITIES
     ============================================================ */

  /** 要素が存在するか確認 */
  function $(selector, context) {
    return (context || document).querySelector(selector);
  }
  function $$(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
  }

  /** トラップフォーカス用: モーダル内のフォーカス可能要素を取得 */
  function getFocusableElements(container) {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
        'textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), details > summary'
      )
    ).filter(el => !el.closest('[hidden]') && !el.closest('[aria-hidden="true"]'));
  }

  /** 一意IDを生成 */
  let _idCounter = 0;
  function uid(prefix) {
    return (prefix || 'ds') + '-' + (++_idCounter);
  }


  /* ============================================================
     1. THEME — ダーク/ライト切替
     Rule #6: Dark-First Token
     ============================================================ */

  const Theme = {
    STORAGE_KEY: 'ds-theme',

    /** 現在のテーマを取得 (light | dark | system) */
    get() {
      return localStorage.getItem(this.STORAGE_KEY) || 'system';
    },

    /** テーマを適用 */
    apply(theme) {
      const html = document.documentElement;
      if (theme === 'system') {
        html.removeAttribute('data-theme');
      } else {
        html.setAttribute('data-theme', theme);
      }
      localStorage.setItem(this.STORAGE_KEY, theme);
      document.dispatchEvent(new CustomEvent('ds:theme-change', { detail: { theme } }));
    },

    /** トグル: light ↔ dark */
    toggle() {
      const current = this.getResolved();
      this.apply(current === 'dark' ? 'light' : 'dark');
    },

    /** システム設定を考慮した実際のテーマを返す */
    getResolved() {
      const stored = this.get();
      if (stored === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return stored;
    },

    /** 初期化 */
    init() {
      this.apply(this.get());
      // OS設定変更を監視
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.get() === 'system') this.apply('system');
      });
    }
  };


  /* ============================================================
     2. MODAL
     ============================================================ */

  const Modal = {
    _stack: [],

    /**
     * モーダルを開く
     * @param {string|HTMLElement} target - backdrop要素またはセレクタ
     */
    open(target) {
      const backdrop = typeof target === 'string' ? $(target) : target;
      if (!backdrop) return;

      backdrop.classList.add('is-open');
      backdrop.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';

      // フォーカストラップ設定
      const focusable = getFocusableElements(backdrop);
      const firstEl = focusable[0];
      const lastEl  = focusable[focusable.length - 1];
      if (firstEl) firstEl.focus();

      const trapHandler = (e) => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl && lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl && firstEl.focus();
          }
        }
      };

      const escHandler = (e) => {
        if (e.key === 'Escape') this.close(backdrop);
      };

      backdrop.addEventListener('keydown', trapHandler);
      backdrop.addEventListener('keydown', escHandler);
      backdrop._trapHandler = trapHandler;
      backdrop._escHandler  = escHandler;

      // backdrop クリックで閉じる
      backdrop._backdropHandler = (e) => {
        if (e.target === backdrop) this.close(backdrop);
      };
      backdrop.addEventListener('click', backdrop._backdropHandler);

      this._stack.push(backdrop);
      backdrop.dispatchEvent(new CustomEvent('ds:modal-open'));
    },

    /**
     * モーダルを閉じる
     * @param {string|HTMLElement} target
     */
    close(target) {
      const backdrop = typeof target === 'string' ? $(target) : target;
      if (!backdrop) return;

      backdrop.classList.remove('is-open');
      backdrop.setAttribute('hidden', '');
      document.body.style.overflow = '';

      backdrop.removeEventListener('keydown', backdrop._trapHandler);
      backdrop.removeEventListener('keydown', backdrop._escHandler);
      backdrop.removeEventListener('click', backdrop._backdropHandler);

      this._stack = this._stack.filter(m => m !== backdrop);
      backdrop.dispatchEvent(new CustomEvent('ds:modal-close'));
    },

    /** トグル */
    toggle(target) {
      const backdrop = typeof target === 'string' ? $(target) : target;
      if (!backdrop) return;
      backdrop.classList.contains('is-open') ? this.close(backdrop) : this.open(backdrop);
    }
  };


  /* ============================================================
     3. TOAST
     ============================================================ */

  const Toast = {
    _container: null,
    _defaults: {
      duration: 4000,
      type: 'info', // info | success | warning | danger
    },

    _getContainer() {
      if (!this._container) {
        this._container = document.createElement('div');
        this._container.className = 'toast-container';
        this._container.setAttribute('role', 'region');
        this._container.setAttribute('aria-label', 'Notifications');
        this._container.setAttribute('aria-live', 'polite');
        document.body.appendChild(this._container);
      }
      return this._container;
    },

    _iconSVG(type) {
      const icons = {
        success: '<svg viewBox="0 0 20 20" fill="currentColor" style="color:var(--color-success)"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
        warning: '<svg viewBox="0 0 20 20" fill="currentColor" style="color:var(--color-warning)"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
        danger:  '<svg viewBox="0 0 20 20" fill="currentColor" style="color:var(--color-danger)"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
        info:    '<svg viewBox="0 0 20 20" fill="currentColor" style="color:var(--color-primary)"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>',
      };
      return icons[type] || icons.info;
    },

    /**
     * トーストを表示
     * @param {object|string} options - {title, message, type, duration} またはメッセージ文字列
     */
    show(options) {
      if (typeof options === 'string') options = { message: options };
      const opts = Object.assign({}, this._defaults, options);

      const container = this._getContainer();
      const toast = document.createElement('div');
      toast.className = `toast toast-${opts.type}`;
      toast.setAttribute('role', 'alert');
      toast.innerHTML = `
        <div class="toast-icon">${this._iconSVG(opts.type)}</div>
        <div class="toast-content">
          ${opts.title ? `<div class="toast-title">${opts.title}</div>` : ''}
          ${opts.message ? `<div class="toast-message">${opts.message}</div>` : ''}
        </div>
        <button class="toast-close" aria-label="閉じる">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      `;

      container.appendChild(toast);

      // アニメーション
      requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('is-visible'));
      });

      // 閉じるボタン
      toast.querySelector('.toast-close').addEventListener('click', () => this._dismiss(toast));

      // 自動消去
      if (opts.duration > 0) {
        const timer = setTimeout(() => this._dismiss(toast), opts.duration);
        toast._timer = timer;
      }

      return toast;
    },

    _dismiss(toast) {
      if (toast._timer) clearTimeout(toast._timer);
      toast.classList.remove('is-visible');
      toast.classList.add('is-hiding');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    },

    // Shortcuts
    success(message, opts) { return this.show({ ...opts, message, type: 'success' }); },
    warning(message, opts) { return this.show({ ...opts, message, type: 'warning' }); },
    danger(message, opts)  { return this.show({ ...opts, message, type: 'danger' }); },
    info(message, opts)    { return this.show({ ...opts, message, type: 'info' }); },
  };


  /* ============================================================
     4. DROPDOWN
     ============================================================ */

  const Dropdown = {
    _activeDropdowns: new Set(),

    /**
     * ドロップダウンを開く
     * @param {HTMLElement} trigger - [data-dropdown-trigger] ボタン
     */
    open(trigger) {
      const targetId = trigger.getAttribute('data-dropdown-target') ||
                       trigger.getAttribute('aria-controls');
      const menu = targetId ? document.getElementById(targetId)
                            : trigger.nextElementSibling;
      if (!menu) return;

      // 他のドロップダウンを閉じる
      this._activeDropdowns.forEach(d => {
        if (d.trigger !== trigger) this.close(d.trigger);
      });

      trigger.setAttribute('aria-expanded', 'true');
      menu.classList.add('is-open');
      menu.removeAttribute('hidden');

      // 位置調整
      this._position(trigger, menu);

      const outsideHandler = (e) => {
        if (!trigger.contains(e.target) && !menu.contains(e.target)) {
          this.close(trigger);
        }
      };
      const escHandler = (e) => {
        if (e.key === 'Escape') { this.close(trigger); trigger.focus(); }
      };

      document.addEventListener('click', outsideHandler, { capture: true });
      document.addEventListener('keydown', escHandler);
      trigger._outsideHandler = outsideHandler;
      trigger._escHandler     = escHandler;
      trigger._menu           = menu;

      this._activeDropdowns.add({ trigger, menu });
      menu.dispatchEvent(new CustomEvent('ds:dropdown-open'));
    },

    close(trigger) {
      const menu = trigger._menu;
      if (!menu) return;

      trigger.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
      menu.setAttribute('hidden', '');

      document.removeEventListener('click', trigger._outsideHandler, { capture: true });
      document.removeEventListener('keydown', trigger._escHandler);

      this._activeDropdowns.forEach(d => {
        if (d.trigger === trigger) this._activeDropdowns.delete(d);
      });
      menu.dispatchEvent(new CustomEvent('ds:dropdown-close'));
    },

    toggle(trigger) {
      trigger.getAttribute('aria-expanded') === 'true'
        ? this.close(trigger)
        : this.open(trigger);
    },

    _position(trigger, menu) {
      const rect = trigger.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      menu.style.minWidth = rect.width + 'px';

      if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        menu.setAttribute('data-placement', 'top');
      } else {
        menu.setAttribute('data-placement', 'bottom');
      }
    }
  };


  /* ============================================================
     5. TABS
     ============================================================ */

  const Tabs = {
    /**
     * タブを初期化
     * @param {HTMLElement} container - [role="tablist"] を含む要素
     */
    init(container) {
      const tablist = container.querySelector('[role="tablist"]') || container;
      const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));

      tabs.forEach((tab, i) => {
        // キーボードナビゲーション
        tab.addEventListener('keydown', (e) => {
          let nextTab = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            nextTab = tabs[(i + 1) % tabs.length];
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            nextTab = tabs[(i - 1 + tabs.length) % tabs.length];
          } else if (e.key === 'Home') {
            nextTab = tabs[0];
          } else if (e.key === 'End') {
            nextTab = tabs[tabs.length - 1];
          }
          if (nextTab) {
            e.preventDefault();
            this.activate(nextTab, tabs);
            nextTab.focus();
          }
        });

        tab.addEventListener('click', () => this.activate(tab, tabs));
      });
    },

    activate(tab, allTabs) {
      const panelId = tab.getAttribute('aria-controls');

      allTabs.forEach(t => {
        const pId = t.getAttribute('aria-controls');
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        t.setAttribute('tabindex', t === tab ? '0' : '-1');
        if (pId) {
          const panel = document.getElementById(pId);
          if (panel) {
            panel.hidden = t !== tab;
            if (t === tab) panel.removeAttribute('hidden');
          }
        }
      });

      tab.dispatchEvent(new CustomEvent('ds:tab-change', { bubbles: true, detail: { panelId } }));
    }
  };


  /* ============================================================
     6. ACCORDION
     ============================================================ */

  const Accordion = {
    init(container) {
      const items = Array.from(container.querySelectorAll('.accordion-item'));
      items.forEach(item => {
        const trigger = item.querySelector('.accordion-trigger');
        const content = item.querySelector('.accordion-content');
        if (!trigger || !content) return;

        // ARIA設定
        const contentId = content.id || uid('accordion-panel');
        const triggerId = trigger.id || uid('accordion-trigger');
        content.id = contentId;
        trigger.id = triggerId;
        trigger.setAttribute('aria-controls', contentId);
        content.setAttribute('aria-labelledby', triggerId);

        // 初期状態
        const isOpen = item.classList.contains('is-open');
        trigger.setAttribute('aria-expanded', String(isOpen));
        if (!isOpen) {
          content.style.height = '0';
          content.style.overflow = 'hidden';
        }

        trigger.addEventListener('click', () => {
          const open = item.classList.toggle('is-open');
          trigger.setAttribute('aria-expanded', String(open));

          if (open) {
            content.style.height = content.scrollHeight + 'px';
            content.addEventListener('transitionend', () => {
              content.style.height = 'auto';
            }, { once: true });
          } else {
            content.style.height = content.scrollHeight + 'px';
            requestAnimationFrame(() => {
              content.style.height = '0';
            });
          }
        });
      });
    }
  };


  /* ============================================================
     7. FORM VALIDATION
     ============================================================ */

  const FormValidation = {
    rules: {
      required: (val) => val.trim() !== '' || '必須項目です',
      email:    (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'メールアドレスの形式が正しくありません',
      minLength:(val, n) => val.length >= n || `${n}文字以上で入力してください`,
      maxLength:(val, n) => val.length <= n || `${n}文字以内で入力してください`,
      pattern:  (val, re) => new RegExp(re).test(val) || '入力形式が正しくありません',
      numeric:  (val) => /^\d+$/.test(val) || '数字のみ入力してください',
    },

    /**
     * フィールドを検証
     * @param {HTMLInputElement} field
     * @returns {string|null} エラーメッセージ or null
     */
    validateField(field) {
      const value = field.value;
      const checks = [];

      if (field.required || field.dataset.required) checks.push('required');
      if (field.type === 'email') checks.push('email');
      if (field.minLength > 0) checks.push(['minLength', field.minLength]);
      if (field.maxLength > 0 && field.maxLength < 9999) checks.push(['maxLength', field.maxLength]);
      if (field.dataset.pattern) checks.push(['pattern', field.dataset.pattern]);
      if (field.dataset.numeric !== undefined) checks.push('numeric');
      if (field.dataset.validate) {
        field.dataset.validate.split(' ').forEach(r => {
          const [name, ...args] = r.split(':');
          checks.push(args.length ? [name, ...args] : name);
        });
      }

      for (const check of checks) {
        const [name, ...args] = Array.isArray(check) ? check : [check];
        const rule = this.rules[name];
        if (!rule) continue;
        const result = rule(value, ...args);
        if (result !== true) return result;
      }
      return null;
    },

    /**
     * フォームグループにエラー/成功を表示
     */
    setFieldState(field, error) {
      const group = field.closest('.form-group');
      if (!group) return;

      field.classList.remove('input-error', 'input-success');
      group.querySelectorAll('.form-error').forEach(el => el.remove());

      if (error) {
        field.classList.add('input-error');
        const errEl = document.createElement('p');
        errEl.className = 'form-error';
        errEl.setAttribute('role', 'alert');
        errEl.textContent = error;
        group.appendChild(errEl);
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', errEl.id = uid('err'));
      } else {
        field.classList.add('input-success');
        field.removeAttribute('aria-invalid');
      }
    },

    /**
     * フォーム全体を検証
     * @returns {boolean}
     */
    validateForm(form) {
      const fields = Array.from(form.querySelectorAll('.input, .select, .textarea'));
      let valid = true;
      let firstError = null;

      fields.forEach(field => {
        const error = this.validateField(field);
        this.setFieldState(field, error);
        if (error && !firstError) {
          firstError = field;
          valid = false;
        }
      });

      if (firstError) firstError.focus();
      return valid;
    },

    /**
     * フォームにリアルタイム検証を付与
     */
    attachLiveValidation(form) {
      form.querySelectorAll('.input, .select, .textarea').forEach(field => {
        field.addEventListener('blur', () => {
          const error = this.validateField(field);
          this.setFieldState(field, error);
        });
        field.addEventListener('input', () => {
          if (field.classList.contains('input-error')) {
            const error = this.validateField(field);
            this.setFieldState(field, error);
          }
        });
      });
    }
  };


  /* ============================================================
     8. AUTO-INIT — data-api
     HTMLにdata属性を書くだけで動作する
     ============================================================ */

  function autoInit() {
    // Theme
    Theme.init();

    // Theme toggle buttons
    $$('[data-action="theme-toggle"]').forEach(btn => {
      btn.addEventListener('click', () => Theme.toggle());
    });

    // Modal triggers
    $$('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', () => Modal.open(btn.getAttribute('data-modal-open')));
    });
    $$('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-modal-close') || btn.closest('.modal-backdrop');
        if (target) Modal.close(target);
      });
    });

    // Dropdown triggers
    $$('[data-dropdown-trigger]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        Dropdown.toggle(btn);
      });
    });

    // Tabs
    $$('[data-tabs]').forEach(container => Tabs.init(container));

    // Accordion
    $$('[data-accordion]').forEach(container => Accordion.init(container));

    // Forms with live validation
    $$('form[data-validate]').forEach(form => {
      FormValidation.attachLiveValidation(form);
      form.addEventListener('submit', (e) => {
        if (!FormValidation.validateForm(form)) {
          e.preventDefault();
        }
      });
    });

    // Loading buttons: prevent double-submit
    $$('form').forEach(form => {
      form.addEventListener('submit', () => {
        form.querySelectorAll('button[type="submit"]').forEach(btn => {
          btn.classList.add('is-loading');
          btn.disabled = true;
        });
      });
    });
  }

  // DOMContentLoaded or immediate
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }


  /* ============================================================
     PUBLIC API
     window.DS でアクセス可能
     ============================================================ */
  global.DS = {
    Theme,
    Modal,
    Toast,
    Dropdown,
    Tabs,
    Accordion,
    FormValidation,
    version: '1.0.0',
  };

})(window);
