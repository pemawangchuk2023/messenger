import prisma from '@/lib/prismadb';
import { getSession } from './getSession';

const getCurrentUser = async () => {
  try {
    const session = await getSession();
    if (!session?.user?.email) {
      return null;
    }
    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });
    if (!currentUser) {
      console.log('No user found with the provided email.');
      return null;
    }
    return currentUser;
  } catch (error) {
    console.log('An error has occurred:', error);
  }
};

export default getCurrentUser;
