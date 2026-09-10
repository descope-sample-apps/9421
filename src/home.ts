export const homePage = `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>9421 Guru — RFC 9421 HTTP Message Signatures</title>
	<meta name="description" content="Verify RFC 9421 HTTP Message Signatures against your own key and watch the signature base get reconstructed step by step.">
	<!-- Descope mark — same favicon as the other gurus (silent-guru/favicon.svg), inlined as a data URI since this app serves no static files. -->
	<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjciIHZpZXdCb3g9IjAgMCAyNCAyNyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1LjI4NDkgMTAuNDU4MUwxNi41MzYzIDguNDkxNjZMMTMuOTg4OCA3LjE1MDg4TDEyLjkxNjIgOS4yMDY3NUMxMi43Mzc0IDkuNTE5NiAxMi40NjkzIDkuNjk4MzcgMTIuMTExNyA5LjY5ODM3QzExLjc1NDIgOS42OTgzNyAxMS40ODYgOS41MTk2IDExLjMwNzIgOS4yMDY3NUwxMC4yMzQ2IDcuMTUwODhMNy42ODcxMyA4LjQ5MTY2TDkuNDc0ODQgMTEuMzA3M0wxNS4yODQ5IDEwLjQ1ODFaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTA2OTVfNTI2ODApIi8+CjxwYXRoIGQ9Ik0xOC41MDI4IDExLjg4ODRMNS44NTQ3NCAxMS45Nzc4VjE0LjUyNTNIOS44MzI0TDcuNjg3MTQgMTcuOTY2NkwxMC4yMzQ2IDE5LjMwNzRMMTEuMzA3MyAxNy4yNTE2QzExLjQ4NiAxNi45Mzg3IDExLjc1NDIgMTYuNzU5OSAxMi4xMTE3IDE2Ljc1OTlDMTIuNDY5MyAxNi43NTk5IDEyLjczNzQgMTYuOTM4NyAxMi45MTYyIDE3LjI1MTZMMTMuOTg4OCAxOS4zMDc0TDE2LjUzNjMgMTcuOTY2NkwxNC43OTMzIDE1LjE5NTdMMTEuNDg2IDE0LjU3TDE4LjUwMjggMTQuNTI1M1YxMS44ODg0WiIgZmlsbD0idXJsKCNwYWludDFfbGluZWFyXzEwNjk1XzUyNjgwKSIvPgo8cGF0aCBkPSJNMTYuNjcwNCAyMi45NzIxQzE3Ljc4NzcgMjIuNzQ4NiAxOC42ODE2IDIyLjI1NyAxOS40NDE0IDIxLjU4NjZDMjAuNTU4NyAyMC41NTg3IDIwLjY5MjggMTkuMTI4NSAyMC42OTI4IDE3LjM0MDhWOS40MzAxN0MyMC42OTI4IDcuNjQyNDYgMjAuNTE0IDYuMjU2OTkgMTkuNDQxNCA1LjE4NDM2QzE4LjY4MTYgNC40NjkyOCAxNy43ODc3IDQuMDIyMzUgMTYuNjcwNCAzLjc5ODg4VjBDMTguNDU4MSAwLjI2ODE1NyAxOS45Nzc3IDAuOTM4NTQ4IDIxLjEzOTcgMi4wNTU4N0MyMi42NTkyIDMuNDg2MDQgMjQgNS40NTI1MiAyNCA3LjkxMDYyVjE4LjcyNjNDMjQgMjEuMTg0NCAyMi42NTkyIDIzLjEwNjIgMjEuMTM5NyAyNC41ODFDMTkuOTc3NyAyNS42OTgzIDE4LjQ1ODEgMjYuMzY4NyAxNi42NzA0IDI2LjYzNjlWMjIuOTcyMVoiIGZpbGw9InVybCgjcGFpbnQyX2xpbmVhcl8xMDY5NV81MjY4MCkiLz4KPHBhdGggZD0iTTIuODYwMzQgMi4wNTU4N0M0LjAyMjM1IDAuOTM4NTQ4IDUuNTQxOTEgMC4yNjgxNTcgNy4zMjk2MiAwVjMuNzk4ODhDNi4yMTIzIDQuMDIyMzUgNS4zMTg0NCA0LjUxMzk3IDQuNTU4NjYgNS4xODQzNkMzLjQ0MTM0IDYuMjEyMjkgMy4zMDcyNyA3LjY0MjQ2IDMuMzA3MjcgOS4zODU0OFYxNy4zNDA4QzMuMzA3MjcgMTkuMTI4NSAzLjQ4NjAzIDIwLjUxNCA0LjU1ODY2IDIxLjU4NjZDNS4zMTg0NCAyMi4zMDE3IDYuMjEyMyAyMi43NDg2IDcuMzI5NjIgMjIuOTcyMVYyNi41OTIyQzUuNTQxOTEgMjYuMzI0IDQuMDIyMzUgMjUuNjUzNiAyLjg2MDM0IDI0LjUzNjNDMS4zNDA3OSAyMy4xMDYyIDAgMjEuMTM5NyAwIDE4LjY4MTZWNy44NjU5MkMwIDUuNDUyNTIgMS4zNDA3OSAzLjUzMDczIDIuODYwMzQgMi4wNTU4N1oiIGZpbGw9InVybCgjcGFpbnQzX2xpbmVhcl8xMDY5NV81MjY4MCkiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMDY5NV81MjY4MCIgeDE9IjEuMTU1ODYiIHkxPSIyNS41MTciIHgyPSIxNy45NjIiIHkyPSItMC41ODE4NzEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzAwODJCNSIvPgo8c3RvcCBvZmZzZXQ9IjAuNDE3MyIgc3RvcC1jb2xvcj0iIzAwRkZGRiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM2RkYxMkQiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDFfbGluZWFyXzEwNjk1XzUyNjgwIiB4MT0iMy40NTI4MSIgeTE9IjI2Ljk5NjIiIHgyPSIyMC4yNTg5IiB5Mj0iMC44OTczNTMiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzAwODJCNSIvPgo8c3RvcCBvZmZzZXQ9IjAuNDE3MyIgc3RvcC1jb2xvcj0iIzAwRkZGRiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM2RkYxMkQiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDJfbGluZWFyXzEwNjk1XzUyNjgwIiB4MT0iNy44MTY5MSIgeTE9IjI5LjgwNjIiIHgyPSIyNC42MjMiIHkyPSIzLjcwNzM2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMwMDgyQjUiLz4KPHN0b3Agb2Zmc2V0PSIwLjQxNzMiIHN0b3AtY29sb3I9IiMwMEZGRkYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNkZGMTJEIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQzX2xpbmVhcl8xMDY5NV81MjY4MCIgeDE9Ii0xLjI5MDE5IiB5MT0iMjMuOTQxOSIgeDI9IjE1LjUxNTkiIHkyPSItMi4xNTcwMiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMDA4MkI1Ii8+CjxzdG9wIG9mZnNldD0iMC40MTczIiBzdG9wLWNvbG9yPSIjMDBGRkZGIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzZGRjEyRCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=">
	<style>
		:root {
			--ground:#f9fafb; --card:#ffffff; --ink:#0a101a; --ink-soft:#3d4653; --ink-mute:#686e78;
			--rule:#e3e6ea; --navy-1:#0f1a2e; --navy-2:#1b2c45; --blue:#0085ff; --blue-soft:#e8f3ff;
			--green-ink:#0b6b4f; --red:#d32f2f; --amber:#8a5300; --amber-bg:rgba(237,108,2,.06); --amber-line:rgba(237,108,2,.18);
			--sans:"Roobert",Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
			--mono:ui-monospace,"SFMono-Regular","SF Mono",Menlo,Consolas,monospace;
		}
		* { box-sizing:border-box; }
		body { margin:0; background:var(--navy-1); color:var(--ink); font-family:var(--sans); line-height:1.6; -webkit-font-smoothing:antialiased; }
		.page-root { position:relative; overflow-x:clip; }
		h1,h2,h3 { margin:0; font-weight:700; letter-spacing:-.02em; }
		p { margin:0; }
		a { color:var(--blue); }
		code { font-family:var(--mono); font-size:.86em; }

		/* ---------- hero: transparent content over the gradient ---------- */
		.hero { position:relative; z-index:1; color:#fff; padding:4.5rem 1.5rem 0; text-align:center; }
		.hero-inner { position:relative; z-index:10; max-width:720px; margin:0 auto 3rem; display:flex; flex-direction:column; align-items:center; gap:1.25rem; }
		.dscp-logo { display:block; height:30px; width:auto; margin:0; }
		.hero-wordmark { display:block; width:100%; max-width:340px; height:auto; }
		.hero p { max-width:560px; color:#c3c5c9; font-size:.95rem; line-height:1.6; margin:0; }

		/* ---------- animated gradient (bga) ---------- */
		.bga-container { position:absolute; top:0; left:0; width:100%; height:100vh; overflow:hidden; z-index:0; background:linear-gradient(40deg,var(--navy-1),var(--navy-2)); }
		.bga-svg { display:none; }
		.bga-gradients-container { position:absolute; inset:0; filter:url(#bga-blurMe) blur(40px); }
		.bga-blob { position:absolute; mix-blend-mode:hard-light; width:80%; height:80%; top:calc(50% - 40%); left:calc(50% - 40%); }
		.bga-blob-1 { background:none; transform-origin:center center; animation:bga-moveVertical 30s ease infinite; }
		.bga-blob-2 { background:radial-gradient(circle at center,rgba(30,100,110,.8) 0,rgba(30,100,110,0) 50%) no-repeat; transform-origin:calc(50% - 400px); animation:bga-moveInCircle 20s reverse infinite; }
		.bga-blob-3 { background:radial-gradient(circle at center,rgba(25,80,100,.8) 0,rgba(25,80,100,0) 50%) no-repeat; transform-origin:calc(50% + 400px); animation:bga-moveInCircle 40s linear infinite; }
		.bga-blob-4 { background:radial-gradient(circle at center,rgba(20,40,80,.8) 0,rgba(20,40,80,0) 50%) no-repeat; transform-origin:calc(50% - 200px); animation:bga-moveHorizontal 40s ease infinite; opacity:.7; }
		.bga-blob-5 { background:radial-gradient(circle at center,rgba(15,30,50,.8) 0,rgba(15,30,50,0) 50%) no-repeat; transform-origin:calc(50% - 800px) calc(50% + 800px); animation:bga-moveInCircle 20s ease infinite; }
		.bga-interactive { position:absolute; width:100%; height:100%; top:-50%; left:-50%; mix-blend-mode:hard-light; opacity:.7; background:radial-gradient(circle at center,rgba(33,255,181,.8) 0,rgba(33,255,181,0) 50%) no-repeat; }
		@keyframes bga-moveHorizontal { 0%{transform:translateX(-50%) translateY(-10%);} 50%{transform:translateX(50%) translateY(10%);} 100%{transform:translateX(-50%) translateY(-10%);} }
		@keyframes bga-moveInCircle { 0%{transform:rotate(0deg);} 50%{transform:rotate(180deg);} 100%{transform:rotate(360deg);} }
		@keyframes bga-moveVertical { 0%{transform:translateY(-50%);} 50%{transform:translateY(50%);} 100%{transform:translateY(-50%);} }
		@media (prefers-reduced-motion:reduce) { .bga-blob { animation:none; } }

		/* ---------- scalloped divider ---------- */
		.section-divider { height:7vw; max-height:58px; position:relative; z-index:1; }
		.section-divider--flip { transform:rotate(180deg); margin-top:-1px; }
		@media (min-width:768px) { .section-divider { height:5vw; } }
		@media (min-width:1200px) { .section-divider { height:4vw; } }
		.section-divider__shape {
			height:100%; background-color:#f9fafb; background-image:radial-gradient(#d5dae4 1.7px,transparent 1.7px);
			background-size:30px 30px; background-position:-15px -15px; position:relative; z-index:0; transform:translateY(1px);
			clip-path:polygon(
				-0.008% 78.072%, 9.847% 78.072%, 9.847% 78.072%, 10.527% 77.753%, 11.192% 76.812%,
				11.837% 75.272%, 12.458% 73.158%, 13.05% 70.493%, 13.608% 67.301%, 14.127% 63.607%,
				14.604% 59.433%, 15.033% 54.804%, 15.409% 49.745%, 16.827% 28.328%, 16.827% 28.328%,
				17.204% 23.268%, 17.633% 18.639%, 18.109% 14.465%, 18.629% 10.771%, 19.187% 7.579%,
				19.779% 4.914%, 20.4% 2.8%, 21.045% 1.26%, 21.71% 0.319%, 22.389% 0%, 77.603% 0%,
				77.603% 0%, 78.282% 0.319%, 78.947% 1.26%, 79.592% 2.8%, 80.213% 4.914%, 80.805% 7.579%,
				81.363% 10.771%, 81.883% 14.465%, 82.359% 18.639%, 82.788% 23.268%, 83.165% 28.328%,
				84.583% 49.745%, 84.583% 49.745%, 84.959% 54.804%, 85.388% 59.433%, 85.865% 63.607%,
				86.384% 67.301%, 86.942% 70.493%, 87.534% 73.158%, 88.155% 75.272%, 88.8% 76.812%,
				89.465% 77.753%, 90.144% 78.072%, 100% 78.072%, 100% 100%, -0.008% 100%, -0.008% 78.072%
			);
		}

		/* ---------- content section: opaque dotted light sheet over the gradient ---------- */
		.content-section { position:relative; z-index:1; background-color:#f9fafb; background-image:radial-gradient(#d5dae4 1.7px,transparent 1.7px); background-size:30px 30px; background-position:-15px -15px; }
		.content-section__inner { max-width:1200px; margin:0 auto; padding:2.5rem 1.25rem 4rem; }

		.notice { display:flex; gap:.6rem; margin:0 0 1.5rem; padding:.65rem .8rem; border-radius:10px; background:var(--amber-bg); border:1px solid var(--amber-line); color:var(--amber); font-size:.85rem; line-height:1.5; }
		.notice strong { color:var(--ink); }

		.grid { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr); gap:1.25rem; }
		@media (max-width:820px) { .grid { grid-template-columns:1fr; } }
		.panel { position:relative; background:var(--card); border:1px solid var(--rule); border-radius:16px; padding:1.5rem; }
		.panel-head { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1.1rem; padding-bottom:.9rem; border-bottom:1px solid var(--rule); }
		.panel-head h2 { font-size:1.05rem; }
		.badge { border:1px solid var(--blue); color:var(--blue); border-radius:100px; padding:.15rem .55rem; font-size:.66rem; text-transform:uppercase; letter-spacing:.1em; font-weight:600; }

		label { display:block; margin:.9rem 0 .4rem; font-size:.75rem; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--ink-mute); }
		label:first-of-type { margin-top:0; }
		textarea {
			width:100%; min-height:86px; border:1px solid var(--rule); border-radius:10px; background:var(--ground);
			color:var(--ink); padding:.7rem .8rem; font:12px/1.55 var(--mono); outline:none; resize:vertical;
		}
		textarea::placeholder { color:#9aa3ad; }
		textarea:focus { border-color:var(--blue); box-shadow:0 0 0 3px var(--blue-soft); }
		#key { min-height:142px; }
		button[type="submit"] {
			width:100%; min-height:48px; margin-top:1.1rem; border:0; border-radius:100px; background:var(--blue);
			color:#fff; padding:.7rem 1.1rem; font:700 .9rem/1 var(--sans); cursor:pointer; transition:filter .15s;
		}
		button[type="submit"]:hover:not(:disabled) { filter:brightness(1.08); }
		button[type="submit"]:focus-visible { outline:2px solid var(--blue); outline-offset:2px; }
		button[type="submit"]:disabled { opacity:.5; cursor:wait; }

		.result-status { font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; padding:.2rem .6rem; border-radius:100px; background:var(--ground); border:1px solid var(--rule); color:var(--ink-mute); }
		.result-status.good { background:rgba(33,255,181,.18); border-color:transparent; color:var(--green-ink); }
		.result-status.bad { background:rgba(211,47,47,.1); border-color:transparent; color:var(--red); }
		.result {
			min-height:360px; margin:0; padding:1rem; overflow:auto; white-space:pre-wrap; overflow-wrap:anywhere;
			background:var(--ground); border:1px solid var(--rule); border-radius:10px; color:var(--ink-mute); font:12px/1.6 var(--mono);
		}
		.result.good { border-color:rgba(33,255,181,.4); color:var(--green-ink); background:rgba(33,255,181,.06); }
		.result.bad { border-color:rgba(211,47,47,.3); color:var(--red); background:rgba(211,47,47,.04); }

		.algorithms { grid-column:1/-1; display:flex; flex-wrap:wrap; gap:.6rem; align-items:center; }
		.algorithms .eyebrow { font-family:var(--mono); font-size:.66rem; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-mute); }
		.algorithms code { padding:.3rem .6rem; border:1px dashed var(--rule); border-radius:8px; color:var(--ink); background:var(--ground); font-size:11px; }

		.page-footer { display:flex; flex-wrap:wrap; justify-content:space-between; gap:1rem; margin-top:1.25rem; color:var(--ink-mute); font-size:.75rem; }
		.page-footer nav { display:flex; gap:1.1rem; }

		/* ---------- resources footer: dark section, the gradient shows through ---------- */
		.resources-section { position:relative; z-index:1; display:grid; place-items:center; padding:4rem 1rem 5rem; color:#fff; }
		.resources-title { font-size:2.25rem; font-weight:700; text-align:center; color:#fff; margin:0 0 2rem; }
		.resources-grid { display:grid; grid-template-columns:1fr; gap:1.5rem; width:100%; max-width:60rem; }
		@media (min-width:768px) { .resources-grid { grid-template-columns:repeat(3,1fr); } }
		.resource-card { display:flex; flex-direction:column; gap:.5rem; background:#fff; border:1px solid #47566a; border-radius:12px; padding:1rem 1.1rem; }
		.resource-card h3 { font-size:1.125rem; font-weight:700; color:#47566a; margin:0; }
		.resource-card p { flex:1; font-size:.875rem; line-height:1.5; color:#47566a; margin:0; }
		.resource-card a { font-size:.875rem; color:var(--blue); text-decoration:none; }
		.resource-card a:hover { text-decoration:underline; }
	</style>
</head>
<body>
<div class="page-root">

	<div class="bga-container" aria-hidden="true">
		<svg class="bga-svg">
			<defs>
				<filter id="bga-blurMe">
					<feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/>
					<feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo"/>
					<feBlend in="SourceGraphic" in2="goo"/>
				</filter>
			</defs>
		</svg>
		<div class="bga-gradients-container">
			<div class="bga-blob bga-blob-1"></div>
			<div class="bga-blob bga-blob-2"></div>
			<div class="bga-blob bga-blob-3"></div>
			<div class="bga-blob bga-blob-4"></div>
			<div class="bga-blob bga-blob-5"></div>
			<div class="bga-interactive"></div>
		</div>
	</div>

	<div class="hero">
		<div class="hero-inner">
			<svg class="dscp-logo" version="1.1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 435.5 113.8" xml:space="preserve"> <style type="text/css"> .dscp-st0{fill:url(#dscp_1_);} .dscp-st2{fill:#FFFFFF;} </style> <linearGradient id="dscp_1_" gradientUnits="userSpaceOnUse" x1="264.2229" y1="93.8124" x2="301.8265" y2="35.4162"> <stop offset="1.481436e-07" style="stop-color:#0083B5"/> <stop offset="0.4173" style="stop-color:#00FFFF"/> <stop offset="0.9952" style="stop-color:#6FF12D"/> </linearGradient> <path class="dscp-st0" d="M284,78.5c2.5-0.5,4.5-1.6,6.2-3.1c2.5-2.3,2.8-5.5,2.8-9.5V48.2c0-4-0.4-7.1-2.8-9.5c-1.7-1.6-3.7-2.6-6.2-3.1 v-8.5c4,0.6,7.4,2.1,10,4.6c3.4,3.2,6.4,7.6,6.4,13.1V69c0,5.5-3,9.8-6.4,13.1c-2.6,2.5-6,4-10,4.6V78.5z"/> <linearGradient id="dscp_2_" gradientUnits="userSpaceOnUse" x1="243.7969" y1="80.6594" x2="281.4005" y2="22.2632"> <stop offset="1.481436e-07" style="stop-color:#0083B5"/> <stop offset="0.4173" style="stop-color:#00FFFF"/> <stop offset="0.9952" style="stop-color:#6FF12D"/> </linearGradient> <path style="fill:url(#dscp_2_);" d="M253.1,31.7c2.6-2.5,6-4,10-4.6v8.5 c-2.5,0.5-4.5,1.6-6.2,3.1c-2.5,2.3-2.8,5.5-2.8,9.4v17.8c0,4,0.4,7.1,2.8,9.5c1.7,1.6,3.7,2.6,6.2,3.1v8.1c-4-0.6-7.4-2.1-10-4.6 c-3.4-3.2-6.4-7.6-6.4-13.1V44.7C246.7,39.3,249.7,35,253.1,31.7z"/> <g> <g> <g> <path class="dscp-st2" d="M29.6,86.5c-5.7,0-10.2-1.9-13.7-5.7c-3.5-3.8-5.2-8.8-5.2-15V48.1c0-6.2,1.7-11.3,5.2-15.1 c3.5-3.8,8-5.7,13.7-5.7c3.7,0,6.9,0.8,9.6,2.3c2.7,1.6,4.7,3.7,6,6.5h0.3V9.6h5.2v75.9h-5.2v-7.8h-0.3c-1.2,2.8-3.2,4.9-6,6.5 C36.5,85.8,33.3,86.5,29.6,86.5z M30.7,82.1c4.7,0,8.3-1.4,10.9-4.3c2.6-2.9,3.9-6.8,3.9-11.9V48.1c0-5.1-1.3-9.1-3.9-12 c-2.6-2.9-6.2-4.3-10.9-4.3c-4.6,0-8.2,1.4-10.8,4.3C17.3,39,16,43,16,48.1v17.8c0,5.1,1.3,9,3.9,11.9S26,82.1,30.7,82.1z"/> <path class="dscp-st2" d="M86.3,86.5c-6.4,0-11.3-1.9-14.9-5.7c-3.6-3.8-5.4-8.8-5.4-15.1V48.1c0-6.3,1.8-11.3,5.4-15.1 c3.6-3.8,8.6-5.7,14.9-5.7s11.2,1.9,14.8,5.7c3.6,3.8,5.3,8.8,5.3,15.1V58H71.2v7.8c0,5,1.3,8.9,3.9,11.8 c2.6,2.9,6.4,4.4,11.2,4.4c3.9,0,7.1-0.9,9.6-2.8c2.5-1.9,4.3-4.4,5.2-7.7h5.2c-1,4.6-3.3,8.3-6.8,11 C96,85.2,91.6,86.5,86.3,86.5z M71.2,53.5h30v-5.4c0-5-1.3-8.9-3.9-11.9c-2.6-2.9-6.3-4.4-11-4.4c-4.8,0-8.6,1.4-11.2,4.3 c-2.6,2.9-3.9,6.8-3.9,11.9V53.5z"/> <path class="dscp-st2" d="M143.2,86.4c-4.4,0-8.2-0.7-11.5-2c-3.3-1.4-5.9-3.3-7.7-5.8c-1.8-2.5-2.7-5.4-2.7-8.8h13.1 c0,2,0.8,3.6,2.4,4.6c1.6,1.1,3.8,1.6,6.6,1.6h4.5c3.2,0,5.7-0.6,7.3-1.8c1.6-1.2,2.4-2.8,2.4-4.9c0-4-2.9-6.4-8.8-7.3l-8-1 c-12-1.7-17.9-7.4-17.9-17.1c0-5.4,1.8-9.5,5.4-12.3c3.6-2.8,8.9-4.2,15.8-4.2h3.9c6.4,0,11.6,1.4,15.5,4.3 c3.9,2.9,5.9,6.7,5.9,11.4h-13.1c0-1.7-0.7-3-2.2-3.9c-1.5-0.9-3.5-1.4-6.2-1.4h-3.9c-5.7,0-8.5,2-8.5,6.1c0,3.5,2.5,5.7,7.6,6.4 l8.1,1.2c6.4,0.9,11.2,2.8,14.3,5.6c3.1,2.8,4.7,6.8,4.7,11.8c0,5.5-1.9,9.7-5.6,12.8c-3.8,3-9.3,4.6-16.6,4.6H143.2z"/> <path class="dscp-st2" d="M207.9,86.5c-4.8,0-9.1-0.9-12.7-2.8c-3.6-1.8-6.4-4.4-8.4-7.8c-2-3.4-3-7.3-3-11.9V49.7c0-4.6,1-8.5,3-11.9 c2-3.4,4.8-6,8.4-7.8c3.6-1.8,7.9-2.8,12.7-2.8c7.2,0,12.9,1.9,17.2,5.6c4.3,3.7,6.5,8.8,6.7,15.1h-12.6c-0.2-3-1.3-5.3-3.4-6.9 c-2-1.6-4.7-2.4-7.9-2.4c-3.5,0-6.2,1-8.2,2.9c-2,1.9-3,4.6-3,8.2v14.4c0,3.5,1,6.3,3,8.2c2,1.9,4.7,2.9,8.2,2.9 c3.3,0,6-0.8,8-2.4c2-1.6,3.1-3.9,3.3-6.9h12.6c-0.2,6.4-2.5,11.4-6.7,15.1C220.8,84.7,215.1,86.5,207.9,86.5z"/> <path class="dscp-st2" d="M315.6,104.2V28.3h12.6v10.3h0.2c1-3.6,2.9-6.4,5.5-8.4c2.7-2,6-3,9.9-3c5.6,0,10.1,2,13.5,5.9 c3.4,4,5.1,9.2,5.1,15.9v15.5c0,6.7-1.7,12.1-5.1,16c-3.4,3.9-7.9,5.9-13.5,5.9c-3.9,0-7.1-1-9.8-3c-2.7-2-4.6-4.8-5.6-8.4h-0.2 l0.3,13v16H315.6z M339.1,75.3c3.3,0,5.9-1,7.7-2.9c1.8-1.9,2.7-4.7,2.7-8.3V49.7c0-3.6-0.9-6.4-2.7-8.3 c-1.8-1.9-4.4-2.9-7.7-2.9s-5.9,1-7.8,3c-1.9,2-2.8,4.8-2.8,8.5v13.7c0,3.7,0.9,6.5,2.8,8.5C333.2,74.3,335.8,75.3,339.1,75.3z" /> <path class="dscp-st2" d="M401,86.5c-4.8,0-9.1-0.9-12.6-2.8c-3.6-1.9-6.4-4.5-8.3-7.8c-2-3.4-3-7.3-3-11.8V49.7c0-4.5,1-8.4,3-11.8 c2-3.4,4.7-6,8.3-7.8c3.6-1.9,7.8-2.8,12.6-2.8c4.8,0,8.9,0.9,12.5,2.8c3.6,1.9,6.3,4.5,8.3,7.8s3,7.3,3,11.8V60h-35.1v4.1 c0,8.1,3.8,12.2,11.5,12.2c5.9,0,9.4-2,10.5-5.9h12.7c-1,4.9-3.6,8.9-7.8,11.8C412.2,85.1,407.1,86.5,401,86.5z M389.6,49.7v2.2 l22.6-0.1v-2.2c0-3.9-0.9-7-2.8-9.1c-1.9-2.1-4.7-3.2-8.4-3.2c-3.8,0-6.6,1.1-8.5,3.2C390.5,42.7,389.6,45.8,389.6,49.7z"/> </g> </g> </g> <g> <linearGradient id="dscp_3_" gradientUnits="userSpaceOnUse" x1="249.2748" y1="84.1868" x2="286.8784" y2="25.7906"> <stop offset="1.481436e-07" style="stop-color:#0083B5"/> <stop offset="0.4173" style="stop-color:#00FFFF"/> <stop offset="0.9952" style="stop-color:#6FF12D"/> </linearGradient> <path style="fill:url(#dscp_3_);" d="M280.9,50.5l2.8-4.4l-5.7-3l-2.4,4.6 c-0.4,0.7-1,1.1-1.8,1.1c-0.8,0-1.4-0.4-1.8-1.1l-2.4-4.6l-5.7,3l4,6.3L280.9,50.5z"/> <linearGradient id="dscp_4_" gradientUnits="userSpaceOnUse" x1="254.4131" y1="87.4956" x2="292.0167" y2="29.0994"> <stop offset="1.481436e-07" style="stop-color:#0083B5"/> <stop offset="0.4173" style="stop-color:#00FFFF"/> <stop offset="0.9952" style="stop-color:#6FF12D"/> </linearGradient> <path style="fill:url(#dscp_4_);" d="M288.1,53.7l-28.3,0.2v5.7l8.9,0l-4.8,7.7 l5.7,3l2.4-4.6c0.4-0.7,1-1.1,1.8-1.1c0.8,0,1.4,0.4,1.8,1.1l2.4,4.6l5.7-3l-3.9-6.2l-7.4-1.4l15.7-0.1V53.7z"/> </g> </svg>
			<svg class="hero-wordmark" viewBox="0 0 480 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="9421 Guru" role="img">
				<rect width="480" height="139.5" fill="url(#g9421_paint0_linear)"/>
				<rect y="134.5" width="480" height="5.19" fill="#7DEDED"/>
				<text x="240" y="99" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="72" letter-spacing="1" fill="#ffffff">9421 Guru</text>
				<defs>
					<linearGradient id="g9421_paint0_linear" x1="240" y1="139.5" x2="240.6" y2="24.9" gradientUnits="userSpaceOnUse">
						<stop stop-color="#0085FF"/>
						<stop offset="0.265" stop-color="#69EAEA" stop-opacity="0.5"/>
						<stop offset="0.649124" stop-color="#A4E185" stop-opacity="0.2"/>
						<stop offset="1" stop-color="#A4E185" stop-opacity="0"/>
					</linearGradient>
				</defs>
			</svg>
			<p>Send a signed HTTP request and its public key, and watch this office reconstruct the signature base and verify the seal against RFC 9421.</p>
		</div>
	</div>

	<div class="section-divider" aria-hidden="true"><div class="section-divider__shape"></div></div>

	<section class="content-section">
		<div class="content-section__inner">
			<p class="notice"><strong>Testing only.</strong>&nbsp;This desk accepts a public key from the request itself, which proves cryptographic validity, not identity — never do this in production.</p>
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
					<div class="panel-head"><h2>Inspection ledger</h2><span class="result-status" id="status">Awaiting item</span></div>
					<pre class="result" id="result">Ready to inspect. Present the exact headers used to sign a POST request to this URL.</pre>
				</section>
				<div class="panel algorithms">
					<span class="eyebrow">Accepted algorithms</span>
					<code>ed25519</code><code>ecdsa-p256-sha256</code><code>ecdsa-p384-sha384</code><code>rsa-pss-sha512</code><code>rsa-v1_5-sha256</code>
				</div>
			</section>
			<footer class="page-footer">
				<span>Registered message inspection for testing and protocol learning.</span>
				<nav><a href="llms.txt">llms.txt</a><a href="." data-api>API JSON</a><a href="https://www.rfc-editor.org/rfc/rfc9421.html">RFC 9421</a></nav>
			</footer>
		</div>
	</section>

	<div class="section-divider section-divider--flip" aria-hidden="true"><div class="section-divider__shape"></div></div>

	<section class="resources-section">
		<h2 class="resources-title">Resources</h2>
		<div class="resources-grid">
			<div class="resource-card">
				<h3>RFC 9421</h3>
				<p>The official HTTP Message Signatures specification this office verifies against.</p>
				<a href="https://www.rfc-editor.org/rfc/rfc9421.html" target="_blank" rel="noopener noreferrer">Read the spec →</a>
			</div>
			<div class="resource-card">
				<h3>RFC 9530</h3>
				<p>Digest Fields — how to sign a request body with a Content-Digest header alongside your signature.</p>
				<a href="https://www.rfc-editor.org/rfc/rfc9530.html" target="_blank" rel="noopener noreferrer">Read the spec →</a>
			</div>
			<div class="resource-card">
				<h3>http-message-sig</h3>
				<p>Cloudflare's RFC 9421 parsing and verification library, for building your own signer or verifier.</p>
				<a href="https://github.com/cloudflare/web-bot-auth/tree/main/packages/http-message-sig" target="_blank" rel="noopener noreferrer">View on GitHub →</a>
			</div>
		</div>
	</section>

</div>
<script>
	const form=document.querySelector('#verifier');
	const result=document.querySelector('#result');
	const status=document.querySelector('#status');
	document.querySelector('[data-api]').addEventListener('click',event=>{event.preventDefault();fetch(location.href,{headers:{accept:'application/json'}}).then(r=>r.json()).then(data=>{result.textContent=JSON.stringify(data,null,2);result.className='result';status.textContent='API manifest';status.className='result-status';}).catch(error=>{result.textContent=String(error);result.className='result bad';status.textContent='Error loading manifest';status.className='result-status bad';});});
	form.addEventListener('submit',async(event)=>{
		event.preventDefault();
		const button=form.querySelector('button');
		button.disabled=true; status.textContent='Inspecting seal'; status.className='result-status'; result.className='result'; result.textContent='Reconstructing signature base…';
		try {
			const additionalHeaders=JSON.parse(document.querySelector('#headers').value||'{}');
			const body=document.querySelector('#body').value;
			const headers={...(body?{'content-type':'application/json'}:{}),...additionalHeaders,'signature-input':document.querySelector('#signature-input').value,'signature':document.querySelector('#signature').value,'x-public-key-pem':document.querySelector('#key').value.replace(/\\r?\\n/g,' ')};
			const response=await fetch(location.href,{method:'POST',headers,body:body||undefined});
			const data=await response.json();
			result.textContent=JSON.stringify(data,null,2); result.classList.add(data.verified?'good':'bad'); status.textContent=data.verified?'Seal verified':'Seal void'; status.classList.add(data.verified?'good':'bad');
		} catch(error) { result.textContent=String(error); result.classList.add('bad'); status.textContent='Inspection error'; status.classList.add('bad'); }
		finally { button.disabled=false; }
	});
</script>
</body>
</html>`;
