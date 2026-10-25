/* Password-protected report viewer.
   Markup: <form class="report-lock" data-report="calibration-system" data-title="...">
   The report lives at reports/<id>.enc, encrypted by tools/encrypt-reports.mjs.
   It is decrypted here in the browser; the password never leaves the page. */
(function () {
  var ITERATIONS = 600000;   // must match tools/encrypt-reports.mjs
  var MAGIC = 'GRENC1';

  async function decrypt(buf, password) {
    var bytes = new Uint8Array(buf);
    if (new TextDecoder().decode(bytes.slice(0, 6)) !== MAGIC) throw new Error('format');
    var salt = bytes.slice(6, 22), iv = bytes.slice(22, 34), data = bytes.slice(34);
    var base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    var key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt, iterations: ITERATIONS, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, data);
  }

  document.querySelectorAll('form.report-lock').forEach(function (form) {
    var id = form.getAttribute('data-report');
    var title = form.getAttribute('data-title') || id;
    var input = form.querySelector('input[type="password"]');
    var button = form.querySelector('button');
    var status = form.querySelector('.report-status');
    var viewer = document.getElementById(form.getAttribute('data-viewer'));
    var encrypted = null;

    function say(text, isError) {
      status.textContent = text;
      status.classList.toggle('is-error', !!isError);
    }

    if (!window.crypto || !crypto.subtle) {
      say('This browser cannot open protected reports. Please email me for a copy.', true);
      button.disabled = true;
      return;
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!input.value) { input.focus(); return; }
      button.disabled = true;
      say('Unlocking…');
      try {
        if (!encrypted) {
          var res = await fetch(new URL('../reports/' + id + '.enc', document.baseURI));
          if (!res.ok) throw new Error('fetch');
          encrypted = await res.arrayBuffer();
        }
        var pdf;
        try { pdf = await decrypt(encrypted, input.value); }
        catch (err) {
          say('That password is not correct.', true);
          if (window.grTrack) window.grTrack('report-wrong-password:' + id, 'Wrong report password: ' + title);
          button.disabled = false;
          input.select();
          return;
        }

        var url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
        var fileName = id + '-report.pdf';
        viewer.querySelector('iframe').src = url;
        viewer.querySelector('.report-open').href = url;
        var dl = viewer.querySelector('.report-download');
        dl.href = url;
        dl.download = fileName;
        say('');
        form.hidden = true;
        viewer.hidden = false;
        if (window.grTrack) window.grTrack('report-unlocked:' + id, 'REPORT UNLOCKED: ' + title);
      } catch (err) {
        say('The report could not be loaded. Please try again or email me.', true);
        button.disabled = false;
      }
    });
  });
})();
