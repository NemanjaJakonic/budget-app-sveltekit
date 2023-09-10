<script>
     export let data;
	import { enhance } from '$app/forms'
     const {transaction} = data
     console.log(transaction);
</script>

<form action="?/editTransaction" method="post" use:enhance>
     <input type="hidden" name="id" value="{transaction[0].id}">
    <h1 class="flex justify-center pt-10 text-2xl font-semibold uppercase">
        Edit Transaction
    </h1>
    <div class="absolute inset-x-0 flex flex-col gap-4 top-60">
        <div class="w-11/12 mx-auto">
            <input class="w-full p-3 placeholder-white bg-[#2F2925] border rounded appearance-none border-[#7C7773] focus:ring-0 outline-none focus:border-primary" value="{transaction[0].name}" type="text" name="name" placeholder="Name"/>
        </div>
        <div class="w-11/12 mx-auto">
            <input class="w-full p-3 placeholder-white bg-[#2F2925] border rounded appearance-none border-[#7C7773] focus:ring-0 outline-none focus:border-primary" value="{transaction[0].amount}" type="text" name="amount" placeholder="Amount"/>
        </div>
        <button class="flex mx-auto justify-center items-center w-24 bg-primary border border-primary py-2.5 px-4 rounded-md mt-6">SUBMIT</button>
    </div>
</form>