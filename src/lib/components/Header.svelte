<script>
	let { firstName } = $props();
</script>

<header class="sticky top-0 z-10 h-14 border-b bg-footerheader border-card">
	<div class="mx-auto max-w-xl">
		<div class="flex justify-between items-center p-3">
			<div class="flex gap-2 items-center">
				<p class="text-sm">
					Welcome back,
					<span class="text-secondary">{firstName}</span>!
				</p>
			</div>

			<a href="/">
				<img src="/logo.svg" alt="logo" class="h-6" />
			</a>

			<form action="/logout" method="post">
				<button class="flex gap-1 items-center text-sm hover:text-expense" type="submit">
					<svg
						class="fill-current size-6"
						version="1.0"
						xmlns="http://www.w3.org/2000/svg"
						width="512.000000pt"
						height="512.000000pt"
						viewBox="0 0 512.000000 512.000000"
						preserveAspectRatio="xMidYMid meet"
					>
						<g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" stroke="none">
							<path
								d="M1590 5109 c-266 -14 -606 -63 -745 -106 -337 -105 -628 -407 -729
-757 -44 -149 -86 -557 -106 -1026 -29 -678 12 -1533 86 -1789 26 -87 103
-251 176 -370 146 -240 271 -361 528 -507 517 -293 1249 -570 1459 -550 215
20 387 222 450 530 11 54 21 100 23 102 2 1 69 12 148 24 186 27 285 52 387
100 326 153 558 453 617 800 54 315 39 398 -83 462 -98 51 -205 33 -283 -48
-47 -47 -63 -98 -78 -239 -24 -234 -65 -338 -174 -446 -94 -93 -186 -134 -360
-160 -76 -11 -140 -18 -142 -16 -2 2 1 104 6 228 21 493 10 1572 -21 1939 -25
309 -116 577 -275 816 -70 106 -207 248 -293 303 -62 40 -351 188 -441 227
l-45 19 195 3 c355 6 794 -25 1050 -74 198 -37 362 -178 426 -363 33 -97 61
-339 84 -734 10 -183 22 -228 76 -281 98 -97 264 -96 347 3 44 53 51 91 43
250 -16 339 -62 700 -106 833 -108 323 -369 596 -678 708 -270 98 -956 151
-1542 119z"
							/>
							<path
								d="M4185 3491 c-87 -40 -135 -114 -135 -209 0 -95 17 -122 193 -299
l161 -163 -594 0 c-557 0 -598 -2 -635 -19 -197 -91 -178 -374 29 -436 41 -13
148 -15 630 -15 l581 0 -162 -162 c-88 -90 -169 -179 -179 -198 -25 -50 -23
-144 4 -196 61 -119 203 -165 320 -105 20 11 173 156 338 323 318 320 338 344
369 465 28 107 13 223 -43 327 -39 75 -608 647 -676 681 -61 31 -142 33 -201
6z"
							/>
						</g>
					</svg>
					<span>Log Out</span>
				</button>
			</form>
		</div>
	</div>
</header>
