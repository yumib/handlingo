import Layout from '@/components/ui/layout';
import AccountForm from "@/components/client/profileForm";
import { getInternalUserByEmail } from "@/utils/databaseQuery";
import { createClient } from "@/utils/supabase/server";

export default async function ProfilePage() {
    const supabase = await createClient(); // Use your `server.ts` function
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (!user) {
        return (
            <Layout>
                <h1>Unauthorized</h1>
                <p>Please log in to view this page.</p>
            </Layout>
        );
    }

    const internalUser = await getInternalUserByEmail(String(user.email));

    return (
        <Layout>
            <h1>My Profile</h1>
            <AccountForm user={internalUser} />
        </Layout>
    );
}
