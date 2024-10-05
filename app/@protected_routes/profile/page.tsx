import { auth } from "@/app/auth";
import { PrismaClient, Note } from "@prisma/client";
import NotesCard from "../../components/NotesCard";

const prisma = new PrismaClient();

async function fetchUserNotes(userId: string): Promise<Note[]> {
  try {
    const filteredNotes = await prisma.note.findMany({
      where: {
        authorId: userId
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    return filteredNotes;
  } catch (error) {
    console.error("Error fetching user notes:", error);
    return [];
  }
}

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session || !session.user) {
    return <p className="text-center mt-8">Please log in to see your profile.</p>;
  }

  const userId = session.user.id;
  const userNotes = await fetchUserNotes(userId || "");

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-4 mb-8">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">
          {session.user.name}'s Profile
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          Email: {session.user.email}
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Your Uploaded Notes</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {userNotes.map((note, index) => (
            <NotesCard key={note.id} note={note} index={index} />
          ))}
        </div>
        
        {userNotes.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400">You haven't uploaded any notes yet.</p>
        )}
      </div>
    </div>
  );
}