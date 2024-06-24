import Link from "next/link";

export default function Page() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <span>ExamCooker 2024</span>
            <Link href={"/home"} className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md"> 
                Append '/home' to localhost link in the searchbox, or click here.
            </Link>
            <span ></span>
        </main>
    );
}