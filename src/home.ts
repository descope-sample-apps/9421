export const homePage = `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Registered Signature Office — RFC 9421</title>
	<meta name="description" content="Inspect RFC 9421 HTTP Message Signatures at the registered signature office.">
	<style>
		:root { color-scheme:light; --bg:#edf2f5; --panel:#ffffff; --raised:#f7f9fa; --ink:#10243e; --muted:#56677a; --line:#b7c5d0; --brass:#b8872f; --bright:#d6a94e; --blue:#075a9c; --red:#c7353c; --green:#177245; }
		* { box-sizing:border-box; }
		body { margin:0; min-height:100vh; background:var(--bg); color:var(--ink); font:15px/1.55 system-ui,sans-serif; }
		body::before { content:""; position:fixed; inset:0; pointer-events:none; opacity:.55; background:repeating-linear-gradient(0deg,transparent 0 39px,rgba(16,36,62,.055) 40px),linear-gradient(135deg,rgba(7,90,156,.06),transparent 32%); }
		main { position:relative; width:min(1160px,calc(100% - 32px)); margin:auto; padding:34px 0 54px; }
		header { display:grid; grid-template-columns:1fr auto; gap:36px; align-items:center; padding:28px 0 34px; border-block:1px solid var(--line); }
		.kicker,.label,label { color:var(--blue); text-transform:uppercase; letter-spacing:.12em; font:700 11px/1.3 system-ui,sans-serif; }
		h1 { max-width:760px; margin:12px 0; font:700 clamp(40px,6vw,72px)/.98 ui-serif,Georgia,serif; letter-spacing:-.035em; }
		.lede { max-width:690px; margin:0; color:var(--muted); font:18px/1.55 ui-serif,Georgia,serif; }
		.postmark { width:164px; aspect-ratio:1; display:grid; place-content:center; border:3px double var(--blue); border-radius:50%; color:var(--blue); text-align:center; transform:rotate(-6deg); box-shadow:inset 0 0 0 8px var(--bg),inset 0 0 0 9px var(--blue); text-transform:uppercase; letter-spacing:.12em; font-size:10px; }
		.postmark strong { display:block; margin:4px 0; font:700 34px/1 ui-serif,Georgia,serif; letter-spacing:-.03em; }
		.notice { display:flex; gap:12px; margin:22px 0 0; padding:13px 16px; border:1px dashed var(--red); background:#fff6f5; color:var(--ink); }
		.notice::before { content:"REGISTERED"; color:var(--red); font-weight:800; letter-spacing:.08em; }
		.grid { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr); gap:20px; margin-top:24px; }
		.panel { position:relative; background:linear-gradient(135deg,var(--raised),var(--panel)); border:1px solid var(--line); padding:25px; box-shadow:6px 6px 0 #c9d3da; }
		.panel::before { content:""; position:absolute; inset:6px; pointer-events:none; border:1px solid rgba(7,90,156,.07); }
		.panel-head { position:relative; display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:20px; padding-bottom:14px; border-bottom:1px solid var(--line); }
		h2 { margin:0; font:700 23px/1.2 ui-serif,Georgia,serif; }
		.badge { border:1px solid var(--blue); color:var(--blue); padding:4px 8px; font-size:10px; text-transform:uppercase; letter-spacing:.1em; }
		label { display:block; margin:15px 0 7px; }
		textarea { width:100%; min-height:86px; border:1px solid var(--line); border-radius:0; background:#f8fafb; color:var(--ink); padding:12px; font:12px/1.55 ui-monospace,"SFMono-Regular",Consolas,monospace; outline:none; resize:vertical; }
		textarea::placeholder { color:#7a8997; }
		textarea:focus { border-color:var(--blue); box-shadow:0 0 0 2px rgba(7,90,156,.16); }
		#key { min-height:142px; }
		button { width:100%; min-height:48px; margin-top:18px; border:1px solid #064879; background:var(--blue); color:#fff; padding:13px 18px; font:800 12px/1 system-ui,sans-serif; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; box-shadow:3px 3px 0 #9db6c8; }
		button:hover { background:#064879; transform:translate(-1px,-1px); }
		button:focus-visible { outline:2px solid var(--ink); outline-offset:4px; }
		button:disabled { opacity:.55; cursor:wait; transform:none; }
		.result { position:relative; min-height:360px; margin:0; padding:20px; overflow:auto; white-space:pre-wrap; overflow-wrap:anywhere; background:#f4f7f9; border:1px solid var(--line); color:var(--muted); font:12px/1.6 ui-monospace,"SFMono-Regular",Consolas,monospace; }
		.result.good { border:2px solid var(--green); color:var(--green); background:#f1faf5; }
		.result.bad { border:2px solid var(--red); color:var(--red); background:#fff5f5; }
		.algorithms { grid-column:1/-1; display:flex; flex-wrap:wrap; gap:8px; align-items:center; padding:18px 24px; }
		.algorithms code { padding:5px 9px; border:1px dashed var(--line); color:var(--ink); font:11px ui-monospace,monospace; }
		footer { display:flex; justify-content:space-between; gap:20px; margin-top:22px; color:var(--muted); font-size:11px; }
		footer nav { display:flex; gap:18px; }
		a { color:var(--blue); }
		@media (max-width:760px) { main{padding-top:18px} header{grid-template-columns:1fr}.postmark{width:112px;position:absolute;right:4px;top:10px;opacity:.35}.grid{grid-template-columns:1fr}.algorithms{overflow:auto;flex-wrap:nowrap}.notice{display:block}.notice::before{display:block;margin-bottom:4px} }
		@media (prefers-reduced-motion:no-preference) { .panel { animation:arrive .42s ease-out both; } .panel:nth-child(2){animation-delay:.08s} @keyframes arrive{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:none}} }
	</style>
</head>
<body>
<main>
	<header>
		<div>
			<div class="kicker">Registered Signature Office / RFC 9421</div>
			<h1>Inspect the seal before delivery.</h1>
			<p class="lede">Present a signed HTTP request and its public key. This desk reconstructs the signature base, checks the seal, and records the result.</p>
			<p class="notice"><span><strong>Testing only.</strong> A verified seal proves cryptographic validity, not identity.</span></p>
		</div>
		<div class="postmark" aria-label="RFC 9421 registered verifier"><span>Registered</span><strong>9421</strong><span>Signature office</span></div>
	</header>
	<section class="grid">
		<form class="panel" id="verifier">
			<div class="panel-head"><h2>Item to inspect</h2><span class="badge">Local input</span></div>
			<label for="signature-input">Signature-Input</label>
			<textarea id="signature-input" required spellcheck="false" placeholder='sig1=("@method" "@path");created=…;keyid="…";alg="ed25519"'></textarea>
			<label for="signature">Signature seal</label>
			<textarea id="signature" required spellcheck="false" placeholder="sig1=:base64-signature:"></textarea>
			<label for="key">Public key (PEM)</label>
			<textarea id="key" required spellcheck="false" placeholder="-----BEGIN PUBLIC KEY-----&#10;…&#10;-----END PUBLIC KEY-----"></textarea>
			<label for="headers">Additional signed headers (JSON, optional)</label>
			<textarea id="headers" spellcheck="false" placeholder='{"content-digest":"sha-256=:…:","x-request-id":"…"}'></textarea>
			<label for="body">POST body (optional)</label>
			<textarea id="body" spellcheck="false" placeholder='{"message":"registered"}'></textarea>
			<button type="submit">Verify and seal</button>
		</form>
		<section class="panel" aria-live="polite">
			<div class="panel-head"><h2>Inspection ledger</h2><span class="label" id="status">Awaiting item</span></div>
			<pre class="result" id="result">Ready to inspect. Present the exact headers used to sign a POST request to this URL.</pre>
		</section>
		<div class="panel algorithms"><span class="label">Accepted algorithms</span><code>ed25519</code><code>ecdsa-p256-sha256</code><code>ecdsa-p384-sha384</code><code>rsa-pss-sha512</code><code>rsa-v1_5-sha256</code></div>
	</section>
	<footer><span>Registered message inspection for testing and protocol learning.</span><nav><a href="llms.txt">llms.txt</a><a href="." data-api>API JSON</a><a href="https://www.rfc-editor.org/rfc/rfc9421.html">RFC 9421</a></nav></footer>
</main>
<script>
	const form=document.querySelector('#verifier');
	const result=document.querySelector('#result');
	const status=document.querySelector('#status');
	document.querySelector('[data-api]').addEventListener('click',event=>{event.preventDefault();fetch(location.href,{headers:{accept:'application/json'}}).then(r=>r.json()).then(data=>{result.textContent=JSON.stringify(data,null,2);result.className='result';status.textContent='API manifest';});});
	form.addEventListener('submit',async(event)=>{
		event.preventDefault();
		const button=form.querySelector('button');
		button.disabled=true; status.textContent='Inspecting seal'; result.className='result'; result.textContent='Reconstructing signature base…';
		try {
			const additionalHeaders=JSON.parse(document.querySelector('#headers').value||'{}');
			const body=document.querySelector('#body').value;
			const headers={...(body?{'content-type':'application/json'}:{}),...additionalHeaders,'signature-input':document.querySelector('#signature-input').value,'signature':document.querySelector('#signature').value,'x-public-key-pem':document.querySelector('#key').value.replace(/\\r?\\n/g,' ')};
			const response=await fetch(location.href,{method:'POST',headers,body:body||undefined});
			const data=await response.json();
			result.textContent=JSON.stringify(data,null,2); result.classList.add(data.verified?'good':'bad'); status.textContent=data.verified?'Seal verified':'Seal void';
		} catch(error) { result.textContent=String(error); result.classList.add('bad'); status.textContent='Inspection error'; }
		finally { button.disabled=false; }
	});
</script>
</body>
</html>`;
