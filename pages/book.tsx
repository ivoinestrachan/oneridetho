import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Ride } from "@/components/Ride";

const Book = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return; 
        if (!session) router.push('/auth/signup');
    }, [session, status, router]);

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    return (
        <div className="mt-10 px-5">
           <Ride />
        </div>
    );
}

export default Book;


