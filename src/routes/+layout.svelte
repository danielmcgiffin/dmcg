<script>
	import "./layout.css";

	let { children } = $props();
</script>

<svelte:head>
	<title>Daniel McGiffin | Founder Constraint Session</title>
	<meta name="description" content="A focused 90-minute working session to find and remove the constraint slowing your company down." />
	<link rel="icon" type="image/png" href="/favicon.png" />
</svelte:head>

<div
	class="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip"
>
	{@render children()}
</div>
