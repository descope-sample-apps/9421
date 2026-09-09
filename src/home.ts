export const homePage = `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>RFC 9421 Signature Workbench</title>
	<meta name="description" content="Inspect and verify HTTP Message Signatures in a focused RFC 9421 workbench.">
	<style>
		:root { color-scheme: dark; --ink:#e8edf3; --muted:#8f9cab; --panel:#111820; --line:#26313d; --blue:#77bdfb; --amber:#ffc46b; --bad:#ff8f87; --good:#79dca5; }
		* { box-sizing:border-box; }
		body { margin:0; min-height:100vh; background:#091017; color:var(--ink); font:15px/1.55 ui-monospace, "SFMono-Regular", Consolas, monospace; }
		body::before { content:""; position:fixed; inset:0; pointer-events:none; background:linear-gradient(90deg,transparent 49.8%,rgba(119,189,251,.035) 50%,transparent 50.2%),linear-gradient(rgba(119,189,251,.025) 1px,transparent 1px); background-size:96px 100%,100% 48px; }
		main { position:relative; width:min(1180px,calc(100% - 32px)); margin:auto; padding:42px 0 64px; }
		header { display:grid; grid-template-columns:1fr auto; gap:32px; align-items:start; padding-bottom:34px; border-bottom:1px solid var(--line); }
		.kicker,.label { color:var(--blue); text-transform:uppercase; letter-spacing:.12em; font-size:11px; }
		h1 { max-width:760px; margin:12px 0 14px; font:600 clamp(36px,6vw,76px)/.98 system-ui,sans-serif; letter-spacing:-.055em; }
		.lede { max-width:650px; margin:0; color:var(--muted); font:18px/1.55 system-ui,sans-serif; }
		.rfc { width:134px; aspect-ratio:1; display:grid; place-content:center; border:1px solid var(--blue); color:var(--blue); text-align:center; transform:rotate(2deg); box-shadow:7px 7px 0 #172838; }
		.rfc strong { display:block; font:700 34px/1 system-ui,sans-serif; }
		.warning { margin:22px 0 0; padding:12px 15px; border-left:3px solid var(--amber); background:#19170f; color:#e8d4ad; }
		.grid { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr); gap:18px; margin-top:24px; }
		.panel { background:rgba(17,24,32,.94); border:1px solid var(--line); padding:24px; }
		.panel-head { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:20px; }
		h2 { margin:0; font:650 21px/1.2 system-ui,sans-serif; }
		.badge { border:1px solid #4a4027; color:var(--amber); padding:3px 8px; font-size:10px; text-transform:uppercase; letter-spacing:.08em; }
		label { display:block; margin:14px 0 6px; color:#c3ccd6; font-size:12px; }
		input,textarea { width:100%; border:1px solid #33404d; border-radius:0; background:#0a1118; color:var(--ink); padding:11px 12px; font:12px/1.5 inherit; outline:none; resize:vertical; }
		input:focus,textarea:focus { border-color:var(--blue); box-shadow:0 0 0 2px rgba(119,189,251,.12); }
		textarea { min-height:86px; }
		#key { min-height:142px; }
		button { width:100%; margin-top:16px; border:0; background:var(--blue); color:#07111a; padding:13px 18px; font:700 13px/1 inherit; cursor:pointer; }
		button:hover { background:#a5d5ff; }
		button:focus-visible { outline:2px solid white; outline-offset:3px; }
		button:disabled { opacity:.55; cursor:wait; }
		.result { min-height:310px; margin:0; padding:18px; overflow:auto; white-space:pre-wrap; overflow-wrap:anywhere; background:#080e14; border:1px solid var(--line); color:var(--muted); }
		.result.good { border-color:#28583e; color:var(--good); }
		.result.bad { border-color:#663b38; color:var(--bad); }
		.algorithms { grid-column:1/-1; display:flex; flex-wrap:wrap; gap:8px; align-items:center; padding:18px 24px; }
		.algorithms code { padding:4px 8px; border:1px solid var(--line); color:#adb8c4; font-size:11px; }
		footer { display:flex; justify-content:space-between; gap:20px; margin-top:18px; color:#697786; font-size:11px; }
		footer a { color:var(--blue); }
		@media (max-width:760px) { main{padding-top:26px} header{grid-template-columns:1fr}.rfc{display:none}.grid{grid-template-columns:1fr}.algorithms{display:none}footer{flex-direction:column} }
		@media (prefers-reduced-motion:no-preference) { .panel { animation:arrive .45s both; } .panel:nth-child(2){animation-delay:.08s} @keyframes arrive{from{opacity:0;transform:translateY(8px)}} }
	</style>
</head>
<body>
<main>
	<header>
		<div>
			<div class="kicker">HTTP Message Signatures / verification console</div>
			<h1>See exactly what your signature proves.</h1>
			<p class="lede">Paste a signed request's headers and public key. The workbench reconstructs the signature base and verifies it against RFC 9421.</p>
			<p class="warning"><strong>Testing only.</strong> Client-supplied public keys establish cryptographic validity, not identity.</p>
		</div>
		<div class="rfc"><span>RFC</span><strong>9421</strong><span>workbench</span></div>
	</header>

	<section class="grid">
		<form class="panel" id="verifier">
			<div class="panel-head"><h2>Request material</h2><span class="badge">local input</span></div>
			<label for="signature-input">Signature-Input</label>
			<textarea id="signature-input" required spellcheck="false" placeholder='sig1=("@method" "@path");created=…;keyid="…";alg="ed25519"'></textarea>
			<label for="signature">Signature</label>
			<textarea id="signature" required spellcheck="false" placeholder="sig1=:base64-signature:"></textarea>
			<label for="key">Public key (PEM)</label>
			<textarea id="key" required spellcheck="false" placeholder="-----BEGIN PUBLIC KEY-----&#10;…&#10;-----END PUBLIC KEY-----"></textarea>
			<label for="body">POST body (optional)</label>
			<textarea id="body" spellcheck="false" placeholder='{"hello":"signed world"}'></textarea>
			<button type="submit">Verify signature</button>
		</form>

		<section class="panel" aria-live="polite">
			<div class="panel-head"><h2>Verification trace</h2><span class="label" id="status">waiting</span></div>
			<pre class="result" id="result">Ready. Supply the exact headers used to sign a POST request to this URL.</pre>
		</section>

		<div class="panel algorithms"><span class="label">accepted algorithms</span><code>ed25519</code><code>ecdsa-p256-sha256</code><code>ecdsa-p384-sha384</code><code>rsa-pss-sha512</code><code>rsa-v1_5-sha256</code><code>hmac-sha256</code></div>
	</section>
	<footer><span>Built for implementation testing and protocol learning.</span><a href="https://www.rfc-editor.org/rfc/rfc9421.html">Read RFC 9421 ↗</a></footer>
</main>
<script>
	const form=document.querySelector('#verifier');
	const result=document.querySelector('#result');
	const status=document.querySelector('#status');
	form.addEventListener('submit',async(event)=>{
		event.preventDefault();
		const button=form.querySelector('button');
		button.disabled=true; status.textContent='checking'; result.className='result'; result.textContent='Reconstructing signature base…';
		try {
			const response=await fetch(location.href,{method:'POST',headers:{'content-type':'application/json','signature-input':document.querySelector('#signature-input').value,'signature':document.querySelector('#signature').value,'x-public-key-pem':document.querySelector('#key').value},body:document.querySelector('#body').value||'{}'});
			const data=await response.json();
			result.textContent=JSON.stringify(data,null,2); result.classList.add(data.verified?'good':'bad'); status.textContent=data.verified?'verified':'rejected';
		} catch(error) {
			result.textContent=String(error); result.classList.add('bad'); status.textContent='error';
		} finally { button.disabled=false; }
	});
</script>
</body>
</html>`;
