<script>
	import { enhance } from '$app/forms'
</script>

<form action="?/login" method="post" use:enhance>
    <h1 class="flex justify-center pt-10 text-2xl font-semibold">
        LOGIN
    </h1>
    <div class="absolute inset-x-0 flex flex-col gap-4 top-60">
        <div class="w-11/12 mx-auto">
            <input class="w-full p-3 placeholder-white bg-[#2F2925] border rounded appearance-none border-[#7C7773] focus:ring-0 outline-none focus:border-primary" type="text" name="email" placeholder="Email"/>
        </div>
        <div class="w-11/12 mx-auto">
            <input class="w-full p-3 placeholder-white bg-[#2F2925] border rounded appearance-none border-[#7C7773] focus:ring-0 outline-none focus:border-primary" type="password" name="password" placeholder="Password"/>
        </div>
        <button class="flex mx-auto justify-center items-center w-24 bg-primary border border-primary py-2.5 px-4 rounded-md mt-6">SUBMIT</button>
    </div>
</form>