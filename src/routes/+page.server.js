import { supabase } from "$lib/supabase";
import { fail, redirect } from '@sveltejs/kit';

export async function load({locals: { getSession }}) {
    const session = await getSession()

    if(session){
        const { data, error } = await supabase.from("transactions").select().eq('user_id', session.user.id);
        if(error){
            console.log(error);
        }
        return {
            transactions: data ?? [],
        };
    }else{
        return {
            transactions: [],
        };
    }

};

export const actions = {
    deleteTransaction: async ({ request, locals: { supabase, getSession } }) => {
      const session = await getSession()
      const formData = await request.formData();
    const id = formData.get('id');
 
      const { error } = await supabase
      .from('transactions')
      .delete()
      .match({id: id, user_id: session.user.id})

  
      if (error) {
        return fail(500, { message: 'Server error. Try again later.', success: false, email })
      }

    //   throw redirect(303, '/')
    },
  }